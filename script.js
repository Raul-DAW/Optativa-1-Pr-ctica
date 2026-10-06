var modelo;

var webcam;

var camaraEncendida = false;



// Archivos del modelo

var archivoModelo = "./model/model.json";

var archivoMetadata = "./model/metadata.json";



// Cargar el modelo

async function cargarModelo() {

    if (modelo == undefined) {

        document.getElementById("resultado").innerHTML =
            "Cargando modelo...";


        modelo = await tmImage.load(
            archivoModelo,
            archivoMetadata
        );


        document.getElementById("resultado").innerHTML =
            "Modelo cargado correctamente";

    }

}



// Iniciar la cámara

async function iniciarCamara() {

    await cargarModelo();


    webcam = new tmImage.Webcam(
        300,
        300,
        true
    );


    await webcam.setup();

    await webcam.play();


    camaraEncendida = true;


    document.getElementById("camara").innerHTML = "";


    document.getElementById("camara").appendChild(
        webcam.canvas
    );


    comprobarCamara();

}



// Comprobar la cámara

async function comprobarCamara() {

    if (camaraEncendida == true) {

        webcam.update();


        var resultados =
            await modelo.predict(webcam.canvas);


        mostrarResultado(
            resultados,
            "Cámara"
        );


        requestAnimationFrame(
            comprobarCamara
        );

    }

}



// Parar la cámara

function pararCamara() {

    camaraEncendida = false;


    if (webcam != undefined) {

        webcam.stop();

    }


    document.getElementById("camara").innerHTML = "";


    document.getElementById("resultado").innerHTML =
        "La cámara está parada";

}



// Cambiar porcentaje

function cambiarPorcentaje() {

    var numero =
        document.getElementById("porcentaje").value;


    document.getElementById("numeroPorcentaje").innerHTML =
        numero;

}



// Mostrar resultado

function mostrarResultado(resultados, origen) {

    var mejor =
        resultados[0];


    for (var i = 0; i < resultados.length; i++) {

        if (resultados[i].probability > mejor.probability) {

            mejor =
                resultados[i];

        }

    }


    var nombre =
        mejor.className;


    var porcentajeResultado =
        mejor.probability * 100;


    porcentajeResultado =
        Math.round(porcentajeResultado);


    var minimo =
        document.getElementById("porcentaje").value;


    if (porcentajeResultado >= minimo) {

        document.getElementById("resultado").innerHTML =
            "Objeto detectado: " +
            nombre +
            " con un " +
            porcentajeResultado +
            "% de coincidencia";

    } else {

        document.getElementById("resultado").innerHTML =
            "No hay suficiente coincidencia. " +
            nombre +
            ": " +
            porcentajeResultado +
            "%";

    }

}



// Subir una imagen

async function subirImagen() {

    await cargarModelo();


    var archivo =
        document.getElementById("imagen").files[0];


    if (archivo == undefined) {

        return;

    }


    var imagen =
        document.getElementById("imagenSubida");


    imagen.src =
        URL.createObjectURL(archivo);


    imagen.onload = async function () {

        var resultados =
            await modelo.predict(imagen);


        mostrarResultado(
            resultados,
            "Imagen"
        );


        guardarHistorial(
            resultados,
            "Imagen"
        );

    };

}



// Guardar historial

function guardarHistorial(resultados, origen) {

    var mejor =
        resultados[0];


    for (var i = 0; i < resultados.length; i++) {

        if (resultados[i].probability > mejor.probability) {

            mejor =
                resultados[i];

        }

    }


    var porcentajeResultado =
        Math.round(
            mejor.probability * 100
        );


    var historial =
        localStorage.getItem("historial");


    if (historial == null) {

        historial = [];

    } else {

        historial =
            JSON.parse(historial);

    }


    var fecha =
        new Date();


    var nuevoResultado = {

        nombre: mejor.className,

        porcentaje: porcentajeResultado,

        origen: origen,

        fecha: fecha.toLocaleString()

    };


    historial.push(
        nuevoResultado
    );


    localStorage.setItem(
        "historial",
        JSON.stringify(historial)
    );


    mostrarHistorial();

}

// Mostrar historial

function mostrarHistorial() {

    var caja =
        document.getElementById("historial");


    var historial =
        localStorage.getItem("historial");


    caja.innerHTML = "";


    if (historial == null) {

        caja.innerHTML =
            "<p>No hay resultados guardados</p>";

        return;

    }


    historial =
        JSON.parse(historial);


    for (var i = 0; i < historial.length; i++) {

        caja.innerHTML +=

            "<div class='resultadoHistorial'>" +

            "<b>" +
            historial[i].nombre +
            "</b>" +

            "<br>" +

            historial[i].porcentaje +
            "% de coincidencia" +

            "<br>" +

            "Origen: " +
            historial[i].origen +

            "<br>" +

            historial[i].fecha +

            "</div>";

    }

}



// Borrar historial

function borrarHistorial() {

    localStorage.removeItem("historial");


    mostrarHistorial();

}



// Mostrar historial al entrar en la página

mostrarHistorial();