(function() {
    let ImageTagsComponent = {
        template: "#image-tags-template",
        data: function() {
            return {
                imageTags: [],
                formTags: "",
                imageId: null
            };
        },
        props: ["selectedImage"],
        mounted: function() {
            this.getTags();
        },
        updated: function() {},
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
            closeImage: function() {
                this.$emit("close-image-modal");
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
            username: "",
            title: "",
            desc: "",
            tags: "",
            file: null,
            selectedImage: location.hash.slice(1),
            oldestImageId: null,
            lowestImageId: null,
            isNotLastImage: true
        },
        created: function() {},
        mounted: function() {
            this.getImages();
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
        },
        destroyed: function() {},
        methods: {
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
                axios
                    .get("/images")
                    .then(({ data }) => {
                        this.images = data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            },
            getMoreImages: function() {
                axios
                    .get(`/more-images/${this.oldestImageId}`)
                    .then(({ data }) => {
                        this.images = this.images.concat(...data);
                    })
                    .catch();
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
                    this.lowestImageId = this.images[
                        this.images.length - 1
                    ].lowest_id;
                    this.oldestImageId = this.images[this.images.length - 1].id;
                    if (this.oldestImageId === this.lowestImageId) {
                        this.isNotLastImage = false;
                    }
                }
            }
        }
    });
})();
