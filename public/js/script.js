(function() {
    let ImageTagsComponent = {
        template: "#image-tags-template",
        data: function() {
            return {
                imageTags: [],
                formTags: "",
                imageId: null,
                tagClicked: null
            };
        },
        props: ["selectedImage"],
        mounted: function() {
            this.getTags();
        },
        updated: function() {
            // console.log("SELECTED IMAGE", this.selectedImage);
        },
        watch: {
            selectedImage: function() {
                this.getTags();
            }
        },
        methods: {
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
            },
            resetForm: function() {
                this.formTags = "";
            },
            clickTag: function(tagId) {
                this.$emit("contact-chicken", tagId);
            },
            deleteTag: function(tagId) {
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
            }
        }
    };

    Vue.component("image-component", {
        template: "#image-template",
        components: { "image-tags-component": ImageTagsComponent },
        data: function() {
            return {
                count: 0,
                image: {},
                comments: [],
                username: "",
                comment: "",
                imageId: null
            };
        },
        props: ["selectedImage"],
        mounted: function() {
            // let myVue = this;
            this.getImage();
        },
        updated: function() {
            const canvas = document.getElementById("canvas");

            if (canvas) {
                canvas.style.height = "84vh";
                canvas.style.width = "84vw";
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.src = "./bulletin-board.jpg";
                // img.src = this.image.url;
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
            }
        },
        watch: {
            selectedImage: function() {
                this.getImage();
            }
        },
        methods: {
            setTag: function(tagId) {
                this.$emit("contact-mother-chicken", tagId);
            },
            closeImage: function(tagId) {
                this.$emit("close-image-modal", tagId);
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
            },
            resetForm: function() {
                this.username = "";
                this.comment = "";
            },
            getImage: function() {
                let self = this;
                axios
                    .get(`/images/${this.selectedImage}`)
                    .then(({ data }) => {
                        if (!data[0]) {
                            return this.closeImage();
                        }
                        self.image = data[0];
                        return axios.get(
                            `/images/${self.selectedImage}/comments`
                        );
                    })
                    .then(result => {
                        if (!result) {
                            return;
                        }
                        const { data } = result;
                        self.comments = data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }
    });

    new Vue({
        el: "#page",
        // components: { Image, Tags },
        data: {
            images: [],
            imageCount: null,
            username: "",
            title: "",
            desc: "",
            tags: "",
            file: null,
            selectedImage: location.hash.slice(1),
            oldestImageId: null,
            lowestImageId: null,
            isNotLastImage: true,
            selectedTag: null,
            tag: null,
            notifications: []
        },
        created: function() {
            this.setImageCount();
        },
        mounted: function() {
            this.getImages();
            this.updateImageCount();
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
                }
            });
        },
        updated: function() {
            this.updateMoreButton();
            this.$watch("imageCount", () => {
                this.notifications.push("A new image has been uploaded");
            });
        },
        destroyed: function() {},
        watch: {
            selectedTag: function() {
                this.getTag();
            }
        },
        methods: {
            setTag: function(tagId) {
                this.selectedTag = tagId;
                this.closeImage();
            },
            upload: function() {
                let myVue = this;
                const fd = new FormData();
                fd.append("image", this.file);
                fd.append("username", this.username);
                fd.append("title", this.title);
                fd.append("desc", this.desc);
                fd.append("tags", this.tags);
                axios.post("/upload", fd).then(({ data }) => {
                    myVue.images.unshift(data);
                    this.resetForm();
                });
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
            setImageCount: function() {
                console.log("counting images");

                axios
                    .get(`/count-images`)
                    .then(({ data }) => {
                        this.imageCount = data.rows[0].image_count;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            updateImageCount: function() {
                setTimeout(() => {
                    this.setImageCount();
                    this.updateImageCount();
                }, 5000);
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
            removeTagFilter: function() {
                this.selectedTag = null;
                this.tag = null;
                this.getImages();
            },
            resetForm: function() {
                this.file = null;
                this.username = "";
                this.title = "";
                this.desc = "";
                this.tags = "";
            },
            fileSelected: function(e) {
                this.file = e.target.files[0];
            },
            closeImage: function() {
                this.getImages();
                this.selectedImage = null;
                location.hash = "";
                history.replaceState(null, null, " ");
            },
            prevImage: function() {
                this.selectedImage--;
                location.hash = `#${this.selectedImage}`;
            },
            nextImage: function() {
                this.selectedImage++;
                location.hash = `#${this.selectedImage}`;
            },
            updateMoreButton: function() {
                if (this.images.length > 0) {
                    this.lowestImageId = this.images.slice(-1)[0].lowest_id;
                    this.oldestImageId = this.images.slice(-1)[0].image_id;
                    console.log("LOWEST ID IN DATABASE", this.lowestImageId);
                    console.log("LOWEST ID IN ARRAY", this.oldestImageId);
                    if (
                        this.oldestImageId === this.lowestImageId ||
                        this.lowestImageId == null
                    ) {
                        this.isNotLastImage = false;
                    } else {
                        this.isNotLastImage = true;
                    }
                }
            }
        }
    });
})();
