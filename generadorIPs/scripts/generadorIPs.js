function mostrarDireccionRed(){
document.getElementById("ip").textContent = "192.168.1.0";


}

// let ejemplo = document.getElementById("ip").textContent;

function mostrarPuertaEnlace(){
document.getElementById("ip").textContent = "192.168.1.1";


}

function generarIP(){
    let numeroAleatorio;
    
    numeroAleatorio = Math.random(); // Entre 0 y 1(excluido)
    numeroAleatorio = numeroAleatorio * 253;
    numeroAleatorio = Math.floor(numeroAleatorio); // Redondea hacia abajo
    numeroAleatorio = numeroAleatorio + 2;

    document.getElementById("ip").textContent = "192.168.1." + numeroAleatorio;


}

function mostrarBroadcast(){
document.getElementById("ip").textContent = "192.168.1.255";


}

function mostrarMascara(){
    document.getElementById("ip").textContent = "255.255.255.0";

}