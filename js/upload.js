var upload = false;
var uploadName;
var port = 2000;

axios.defaults.baseURL = location.protocol + '//' + location.hostname;

const app = new Vue({
    el: '#app',
    data: {
        result: null,
        error: false,
    },
    methods: {
        uploadFiles() {
            this.result = null;
            let formData = new FormData();
            let fileuploader = document.querySelector('#fileuploader');
            if (fileuploader.files && fileuploader.files.length > 0) {
                if (fileuploader.files[0].size > 0) {
                    let parse = fileuploader.files[0].name.split(".");
                    let fileType = parse[parse.length - 1];
                    if (fileType == "owl") {
                        show('uploading', true);
                    } else {
                        alert("Please upload OWL file!")
                    }
                    this.error = false;
                    formData.append("owlfile", fileuploader.files[0]);
                    axios.post('/ontoplot/upload.php', formData, {
                    // axios.post('/ontoplot-temp/upload.php', formData, {
                    // axios.post('upload.php', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then((response) => {
                        if (fileType == "owl") {
                            if (response.status == 200 && response.data != "") {
                                this.result = response.data;
                                upload = true;
                                uploadName = response.data;
                                redrawByOnto();
                            }
                        }
                    }).catch((error) => {
                    });
                } else {
                    alert("Empty file!")
                }
            } else {
                this.error = true;
            }
        },
        getData() {
            return axios.get('/data');
        }
    }
});
