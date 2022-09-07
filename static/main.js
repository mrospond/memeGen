const MAX_CANVAS_WIDTH = 500;
const MAX_CANVAS_HEIGHT = 500;

const addImage = function (img, canvas) {
    let imgWidth = img.width;
    let imgHeight = img.height;
    let canvasWidth = canvas.getWidth();
    let canvasHeight = canvas.getHeight();

    let imgRatio = imgWidth / imgHeight;
    let canvasRatio = canvasWidth / canvasHeight;
    if (imgRatio <= canvasRatio) {
        if (imgHeight > canvasHeight) {
            img.scaleToHeight(canvasHeight);
        }
    } else {
        if (imgWidth > canvasWidth) {
            img.scaleToWidth(canvasWidth);
        }
    }

  canvas.clear();
  canvas.add(img);
  canvas.centerObject(img);
}

const canvas = new fabric.Canvas('canvas', {
    width: MAX_CANVAS_WIDTH,
    height: MAX_CANVAS_HEIGHT,
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
            addImage(img, canvas)
        //     if(img.width > 500)
        //     {
        //         img.width = window.innerWidth/2;
        //         console.log(img.width)
        //     }
        //     canvas.setHeight(img.height);
        //     canvas.setWidth( img.width);
        //
        //     if(img.width > canvas.width){
        //
        //         //img.scaleToWidth(canvas.width)
        //     }
             })

        console.log(canvas.height)
    }

    reader.readAsDataURL(img)
})

let addTextBtn = document.getElementById('addText')
let text = document.getElementById('text')
let color = document.getElementById('color')
let fontControl = document.getElementById('font-control')




addTextBtn.addEventListener('click', function(){
    let _text = new fabric.IText(text.value, {
        fontFamily: fontControl.value,
        left: 100,
        top: 100,
        fontSize: 50,
        fill: color.value
    })
    canvas.add(_text)
})

fontControl.addEventListener('change', function (){
    canvas.getActiveObject().fontFamily = fontControl.value;
    canvas.renderAll();
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
            addImage(img, canvas)
        })
    })
}

let saveBtn = document.getElementById('save')
saveBtn.addEventListener('click', function(){
    let data = canvas.toDataURL()
    let link = document.createElement('a')
    link.href = data
    link.download = 'image.png'
    link.click()
})