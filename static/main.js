const canvas = new fabric.Canvas('canvas', {
    width: 500,
    height: 500,
    backgroundColor: '#fff'
})
canvas.preserveObjectStacking = true

let file = document.getElementById('file')

file.addEventListener('change', function(){
    let img = file.files[0]
    if(!img){
        return
    }
    if (img['type'].split('/')[0] !== 'image') {
        alert("You have to upload an image!")
        file.value = null
        return
    }
    let reader = new FileReader()

    reader.onload = function(e){
        let data = reader.result
        fabric.Image.fromURL(data, function(img){
            canvas.add(img)
            if(img.width > canvas.width){
                img.scaleToWidth(canvas.width)
            }
        })
        console.log(data)
    }

    reader.readAsDataURL(img)
})

let addTextBtn = document.getElementById('addText')
let text = document.getElementById('text')
let color = document.getElementById('color')

addTextBtn.addEventListener('click', function(){
    let _text = new fabric.IText(text.value, {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: color.value
    })
    canvas.add(_text)
})

window.addEventListener('keydown', function(e){
    if(e.key === "Delete"){
        canvas.remove(canvas.getActiveObject())
    }
})

let templates = document.getElementById('templates').getElementsByClassName('dropdown-item')
for (let i = 0; i < templates.length; i++) {
    let template = templates[i].getElementsByTagName('img')[0]
    template.addEventListener('click', function (){
        fabric.Image.fromURL(template.src, function(img){
            canvas.add(img)
            if(img.width > img.height){
                img.scaleToWidth(canvas.width)
                img.set({
                    top: (canvas.height - img.getScaledHeight()) / 2
                });
            } else {
                img.scaleToHeight(canvas.height)
                img.set({
                    left: (canvas.width - img.getScaledWidth()) / 2
                });
            }
        })
    })
}

canvas.on('object:moving', function (e) {
    var obj = e.target;
    // if object is too big ignore
    if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
        return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
        obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
        obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
        obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
        obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
    }
});

let saveBtn = document.getElementById('save')
saveBtn.addEventListener('click', function(){
    let data = canvas.toDataURL()
    let link = document.createElement('a')
    link.href = data
    link.download = 'image.png'
    link.click()
})