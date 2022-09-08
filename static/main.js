const canvas = new fabric.Canvas('canvas', {
    width: 500,
    height: 500,
    backgroundColor: '#fff',
    preserveObjectStacking: true
})

let file = document.getElementById('file')
let images = []

$().ready(function () {
    $.ajax({
        url: 'https://api.memegen.link/templates/',
        method: 'GET',
        dataType: 'json'
    }).done(function (data) {
        for (let item of data) {
            images.push(item)
        }

        let dropDownMenu = document.getElementById('templates')
        for (let _template of images) {
            let a = document.createElement('a')
            let img = document.createElement('img')
            let name = document.createElement('p')

            a.classList.add('dropdown-item')

            img.src = _template['blank']
            img.alt = "Not found"
            img.style.width = "200px"

            name.innerText = _template['name']

            a.append(img, name)
            dropDownMenu.appendChild(a)
        }

        let templates = document.getElementById('templates').getElementsByClassName('dropdown-item')
        for (let i = 0; i < templates.length; i++) {
            let template = templates[i].getElementsByTagName('img')[0]
            template.addEventListener('click', function () {
                fabric.Image.fromURL(template.src, function (img) {
                    canvas.add(img)
                    centerImg(canvas, img)
                })
            })
        }
    })
})

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
            centerImg(canvas, img)
        })
        console.log(data)
    }

    reader.readAsDataURL(img)
})

let addTextBtn = document.getElementById('addText')
let text = document.getElementById('text')
let color = document.getElementById('color')
let searchBtn = document.getElementById('searchBtn')
let searchField = document.getElementById('searchField')
let templateList = document.getElementById('templateResults')

searchBtn.addEventListener('click', function() {
    templateList.innerHTML = ''
    let query = searchField.value
    if (query === '') {
        return
    }
    const regex = new RegExp("(\\s|^)" + query, 'i')
    for (let _template of images) {
        if (regex.test(_template.name)) {
            let div = document.createElement('div')
            let img = document.createElement('img')
            let name = document.createElement('p')

            div.classList.add('template-item')
            div.style.cursor = "pointer"

            img.src = _template['blank']
            img.alt = "Not found"
            img.style.width = "200px"

            name.innerText = _template['name']

            div.append(img, name)
            div.addEventListener('click', function () {
                fabric.Image.fromURL(img.src, function (img) {
                    canvas.add(img)
                    centerImg(canvas, img)
                })
            })
            templateList.appendChild(div)
        }
    }
})

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
    if(e.key === "Delete" || e.key === "Backspace"){
        canvas.remove(canvas.getActiveObject())
    }
})

function centerImg(canvas, img) {
    if (img.width > img.height) {
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
