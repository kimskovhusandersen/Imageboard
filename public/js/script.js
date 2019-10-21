(function() {
    let ImageTagsComponent = {
        template: "#image-tags-template",
        data: function() {
            return {
                imageTags: [],
                formTags: "",
                imageId: null,
                tagClicked: null,
                isGettingTagged: false
            };
        },
        props: ["selectedImage"],
        mounted: function() {
            this.getTags();
            addEventListener("keydown", e => {
                if (this.isGettingTagged) {
                    if (e.keyCode == 13) {
                        this.submitTags();
                    }
                }
            });
        },
        updated: function() {},
        watch: {
            selectedImage: function() {
                this.getTags();
            }
        },
        methods: {
            tagSelected: function(tagId) {
                this.$emit("tag-selected", tagId);
            },
            removeTagFromImage: function(tagId) {
                let fd = {
                    tagId
                };
                axios
                    .post(`/images/${this.selectedImage}/tags/delete`, fd)
                    .then(({ data }) => {
                        this.imageTags = this.imageTags.filter(tag => {
                            if (tag.tag_id != data.rows[0].tag_id) {
                                return tag;
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            getTags: function() {
                axios
                    .get(`/images/${this.selectedImage}/tags`)
                    .then(({ data }) => {
                        this.imageTags = data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            resetForm: function() {
                this.formTags = "";
            },
            submitTags: function() {
                let fd = {
                    tags: this.formTags,
                    imageId: this.selectedImage
                };
                axios
                    .post(`/images/${this.selectedImage}/tags`, fd)
                    .then(({ data }) => {
                        this.imageTags = this.imageTags.concat(...data);
                        this.resetForm();
                    });
            }
        }
    };

    Vue.component("show-image-component", {
        template: "#show-image-template",
        components: {
            "image-tags-component": ImageTagsComponent
        },
        data: function() {
            return {
                comment: "",
                comments: [],
                count: 0,
                image: {},
                imageId: null,
                username: "",
                isGettingCommented: false
            };
        },
        props: ["selectedImage"],
        mounted: function() {
            this.getImage();
            addEventListener("keydown", e => {
                if (
                    this.isGettingCommented &&
                    this.comment != "" &&
                    this.username != ""
                ) {
                    if (e.keyCode == 13) {
                        this.submitComment();
                    }
                }
            });
        },
        updated: function() {},
        watch: {
            selectedImage: function() {
                this.getImage();
            }
        },
        methods: {
            closeImage: function(tagId) {
                this.$emit("close-image-modal", tagId);
            },
            getImage: function() {
                axios
                    .get(`/images/${this.selectedImage}`)
                    .then(({ data }) => {
                        if (!data[0]) {
                            return this.closeImage();
                        }
                        this.image = data[0];
                        return axios.get(
                            `/images/${this.selectedImage}/comments`
                        );
                    })
                    .then(result => {
                        if (!result) {
                            return;
                        }
                        const { data } = result;
                        this.comments = data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            tagSelected: function(tagId) {
                this.$emit("tag-selected", tagId);
            },
            resetForm: function() {
                this.username = "";
                this.comment = "";
            },
            submitComment: function() {
                let fd = {
                    username: this.username,
                    comment: this.comment,
                    imageId: this.selectedImage
                };
                axios
                    .post(`/images/${this.selectedImage}/comments`, fd)
                    .then(({ data }) => {
                        this.comments.unshift(data);
                        this.resetForm();
                    });
            }
        }
    });

    let UploadImageComponent = {
        template: "#upload-image-template",
        data: function() {
            return {
                desc: "",
                file: null,
                tags: "",
                title: "",
                username: "",
                isFormValid: false
            };
        },
        props: ["isUploadingImage"],
        mounted: function() {
            addEventListener("keydown", e => {
                if (this.isFormValid && this.isUploadingImage) {
                    if (e.keyCode == 13) {
                        this.upload();
                    }
                }
            });
        },
        updated: function() {},
        destroyed: function() {},
        watch: {
            desc: function() {
                if (
                    this.file != null &&
                    this.username != "" &&
                    this.title != "" &&
                    this.desc != ""
                ) {
                    this.isFormValid = true;
                } else this.isFormValid = false;
            }
        },
        methods: {
            closeImageUpload: function() {
                this.$emit("close-image-upload-modal");
            },
            fileSelected: function(e) {
                this.file = e.target.files[0];
            },
            upload: function() {
                if (!this.isFormValid) {
                    return;
                }
                const fd = new FormData();
                fd.append("image", this.file);
                fd.append("username", this.username);
                fd.append("title", this.title);
                fd.append("desc", this.desc);
                fd.append("tags", this.tags);
                axios
                    .post("/upload", fd)
                    .then(({ data }) => {
                        this.resetForm();
                        this.$emit("append-image", data);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            resetForm: function() {
                this.file = null;
                this.username = "";
                this.title = "";
                this.desc = "";
                this.tags = "";
                this.closeImageUpload();
            }
        }
    };

    new Vue({
        el: "#page",
        components: {
            "upload-image-component": UploadImageComponent
        },
        data: {
            images: [],
            imageCount: null,
            isNotLastImage: false,
            isUploadingImage: false,
            lowestImageId: null,
            notifications: [],
            oldestImageId: null,
            selectedImage: location.hash.slice(1),
            selectedTag: null,
            tag: null
        },
        mounted: function() {
            this.getImages();
            this.setImageCount();
            addEventListener("hashchange", () => {
                this.selectedImage = location.hash.slice(1);
            });
            addEventListener("keydown", e => {
                if (this.selectedImage) {
                    if (e.keyCode == 27) {
                        this.closeImage();
                    }
                    if (e.keyCode == 37) {
                        this.prevImage();
                    }
                    if (e.keyCode == 39) {
                        this.nextImage();
                    }
                } else if (this.isUploadingImage) {
                    if (e.keyCode == 27) {
                        this.isUploadingImage = false;
                    }
                }
            });
        },
        updated: function() {
            this.updateMoreButton();
        },
        watch: {
            selectedTag: function() {
                if (this.selectedTag != null) {
                    this.getTag();
                }
            },
            imageCount: function(newValue, oldValue) {
                if (oldValue != null) {
                    if (this.notifications.length == 0) {
                        this.notifications.push(
                            "A new image has been uploaded"
                        );
                    }
                }
            }
        },
        methods: {
            appendImage: function(data) {
                this.imageCount++;
                this.images.unshift(data);
            },
            closeImage: function() {
                this.getImages();
                this.selectedImage = null;
                location.hash = "";
                history.replaceState(null, null, " ");
            },
            closeImageUpload: function() {
                this.isUploadingImage = false;
            },
            getImages: function() {
                let path = "/images";
                if (!isNaN(this.selectedTag) && this.selectedTag != null) {
                    path += `/tags/${this.selectedTag}`;
                }
                axios
                    .get(path)
                    .then(({ data }) => {
                        this.images = data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            getMoreImages: function() {
                let path = `/more-images/${this.oldestImageId}`;
                if (!isNaN(this.selectedTag) && this.selectedTag != null) {
                    path += `/tags/${this.selectedTag}`;
                }
                axios
                    .get(path)
                    .then(({ data }) => {
                        this.images = this.images.concat(...data);
                    })
                    .catch();
            },
            getTag: function() {
                axios
                    .get(`/tag/${this.selectedTag}`)
                    .then(({ data }) => {
                        this.tag = data[0];
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            nextImage: function() {
                this.selectedImage++;
                location.hash = `#${this.selectedImage}`;
            },
            notificationClicked: function() {
                this.getImages();
                this.notifications = [];
            },
            prevImage: function() {
                this.selectedImage--;
                location.hash = `#${this.selectedImage}`;
            },
            removeTagFilter: function() {
                this.selectedTag = null;
                this.tag = null;
                this.getImages();
            },
            setImageCount: function() {
                setTimeout(() => {
                    axios
                        .get(`/count-images`)
                        .then(({ data }) => {
                            if (this.imageCount < data.rows[0].image_count) {
                                this.imageCount = data.rows[0].image_count;
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    this.setImageCount();
                }, 5000);
            },
            setTag: function(tagId) {
                this.selectedTag = tagId;
                this.closeImage();
            },
            updateMoreButton: function() {
                if (this.images.length > 0) {
                    this.lowestImageId = this.images.slice(-1)[0].lowest_id;
                    this.oldestImageId = this.images.slice(-1)[0].image_id;
                    if (
                        this.oldestImageId === this.lowestImageId ||
                        this.lowestImageId == null
                    ) {
                        this.isNotLastImage = false;
                    } else {
                        this.isNotLastImage = true;
                    }
                }
            },
            uploadImage: function() {
                this.isUploadingImage = true;
            }
        }
    });
})();
