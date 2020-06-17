async function handleImageUpload(image,uploadPreset='instagram'){
    const data = new FormData()
    data.append('file',image)
    data.append('upload_preset',uploadPreset)
    data.append('cloud_name','geopinsimages')
    const response = await fetch('https://api.cloudinary.com/v1_1/geopinsimages/image/upload',{
        method:"POST",
        accept:'application/json',
        body: data,
    })
    const jsonResponse = await response.json()
    return jsonResponse.url;
}

export default handleImageUpload