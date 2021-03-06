const convertBtn = document.getElementById('convert-button');
const urlArea = document.getElementById('url-area');

const fileDownload = (data, filename, mime, bom) => {
    const blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
    const blob = new Blob(blobData, {type: mime || 'application/octet-stream'});
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click();

        // Fixes "webkit blob resource error 1"
        setTimeout(function() {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
        }, 200)
    }
}

convertBtn.addEventListener('click', () => {
    const urls = urlArea.value.split('\n')

    urls.forEach((url) => {
        let fileName = ""
        fetch(`./download?url=${url}`, {
            method:'GET'
        })
            .then(res => {
                fileName = res.headers.get('File-Name')
                return res.blob()
            })
            .then((res) => {
                fileDownload(res, fileName)
            })
    })
});