(function() {
    new Vue({
        el: "#page",
        data: {
            title: "Project Imageboard",
            className: "funky",
            images: [],
            chicken: "Jody"
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
            handleClick: function() {
                console.log(this.chicken);
            }
        }
    });
})();
