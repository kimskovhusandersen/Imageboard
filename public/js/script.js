(function() {
    new Vue({
        el: "#page",
        data: {
            images: [],
            username: "",
            title: "",
            desc: "",
            file: null
        },
        created: function() {
            console.log("Created");
        },
        mounted: function() {
            console.log("Mounted");
            let myVue = this;
            axios
                .get("/images")
                .then(({ data }) => {
                    myVue.images = data;
                })
                .catch(err => {
                    console.log(err);
                });
        },
        updated: function() {
            console.log("Updated");
        },
        methods: {
            upload: function() {
                const fd = new FormData();
                fd.append("image", this.file);
                fd.append("username", this.username);
                fd.append("title", this.title);
                fd.append("desc", this.desc);
                axios.post("/upload", fd).then(function(res) {
                    console.log(res);
                });
            },
            handleClick: function() {
                console.log(this.file);
            },
            fileSelected: function(e) {
                console.log(e.target.files);
                this.file = e.target.files[0];
            }
        }
    });
})();
