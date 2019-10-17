(function() {
    Vue.component("first-component", {
        template: "#image-template",
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
            axios
                .get(`/images/${this.selectedImage}`)
                .then(({ data }) => {
                    this.image = data[0];
                    return axios.get(`/images/${this.selectedImage}/comments`);
                })
                .then(({ data }) => {
                    this.comments = data;
                })
                .catch(err => {
                    console.log(err);
                });
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
            }
        }
    });

    new Vue({
        el: "#page",
        data: {
            images: [],
            username: "",
            title: "",
            desc: "",
            file: null,
            selectedImage: null,
            oldestImageId: null,
            lowestImageId: null,
            isNotLastImage: true
        },
        created: function() {},
        mounted: function() {
            this.getImages();
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
                console.log();
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
            },
            handleClick: function() {
                // console.log(this.file);
            },
            fileSelected: function(e) {
                // console.log(e.target.files);
                this.file = e.target.files[0];
            },
            closeImage: function() {
                this.selectedImage = null;
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
