const pantalla = document.getElementById("pantalla");
const operadores = new Set(["+", "-", "*", "/"]);
const ultimaCuentaTexto = document.getElementById("ultima-cuenta");
const estadoMemoria = document.getElementById("estado-memoria");
const claveUltimaCuenta = "calculadora.ultimaCuenta";

let tokens = [];
let valorActual = "0";
let valorIntroducido = false;
let resultadoMostrado = false;
let estadoError = false;
let ultimaCuenta = null;

function actualizarPantalla() {
  const expresion = tokens.join("") + (valorIntroducido ? valorActual : "");
  pantalla.value = (expresion || "0").replace(/\./g, ",");
}

function prepararNuevaEntrada() {
  if (estadoError) {
    borrar();
  }

  if (resultadoMostrado) {
    tokens = [];
    valorActual = "0";
    valorIntroducido = false;
    resultadoMostrado = false;
  }
}

function escribir(valor) {
  if (operadores.has(valor)) {
    seleccionarOperador(valor);
    return;
  }

  if (valor !== "," && !/^\d$/.test(valor)) {
    return;
  }

  prepararNuevaEntrada();

  if (valor === ",") {
    if (!valorIntroducido) {
      valorActual = "0.";
      valorIntroducido = true;
    } else if (valorActual === "-") {
      valorActual = "-0.";
    } else if (!valorActual.includes(".")) {
      valorActual += ".";
    }
  } else if (!valorIntroducido) {
    valorActual = valor;
    valorIntroducido = true;
  } else if (valorActual === "-") {
    valorActual += valor;
  } else if (valorActual === "0") {
    valorActual = valor;
  } else if (valorActual === "-0") {
    valorActual = `-${valor}`;
  } else {
    valorActual += valor;
  }

  actualizarPantalla();
}

function seleccionarOperador(operador) {
  if (estadoError) {
    borrar();
  }

  if (resultadoMostrado) {
    tokens = [valorActual];
    valorIntroducido = false;
    resultadoMostrado = false;
  }

  const ultimoToken = tokens[tokens.length - 1];
  if (
    valorIntroducido &&
    valorActual === "-" &&
    operadores.has(ultimoToken)
  ) {
    if (operador === "-") {
      return;
    }

    tokens[tokens.length - 1] = operador;
    valorActual = "0";
    valorIntroducido = false;
    actualizarPantalla();
    return;
  }

  if (valorIntroducido && valorActual !== "-") {
    tokens.push(valorActual);
    valorIntroducido = false;
  }

  if (tokens.length === 0) {
    if (operador === "-") {
      valorActual = "-";
      valorIntroducido = true;
    }
  } else if (operadores.has(tokens[tokens.length - 1])) {
    if (operador === "-" && !valorIntroducido) {
      valorActual = "-";
      valorIntroducido = true;
    } else {
      tokens[tokens.length - 1] = operador;
    }
  } else {
    tokens.push(operador);
  }

  actualizarPantalla();
}

function insertarEuler() {
  prepararNuevaEntrada();
  valorActual = formatearNumero(Math.E);
  valorIntroducido = true;
  actualizarPantalla();
}

function cambiarSigno() {
  if (estadoError) {
    borrar();
  }

  if (!valorIntroducido) {
    valorActual = "-0";
    valorIntroducido = true;
  } else if (valorActual === "-") {
    valorActual = "0";
  } else if (valorActual.startsWith("-")) {
    valorActual = valorActual.slice(1);
  } else {
    valorActual = `-${valorActual}`;
  }

  actualizarPantalla();
}

function borrarEntrada() {
  if (estadoError) {
    borrar();
  } else {
    valorActual = "0";
    valorIntroducido = true;
    resultadoMostrado = false;
    actualizarPantalla();
  }

  borrarUltimaCuenta();
}

function borrar() {
  tokens = [];
  valorActual = "0";
  valorIntroducido = false;
  resultadoMostrado = false;
  estadoError = false;
  actualizarPantalla();
}

function calcular() {
  if (resultadoMostrado && tokens.length === 0) {
    return;
  }

  const expresion = [...tokens];
  if (valorIntroducido && valorActual !== "-") {
    expresion.push(valorActual);
  }

  if (expresion.length === 0 || operadores.has(expresion[expresion.length - 1])) {
    return;
  }

  let resultado;
  try {
    resultado = formatearNumero(evaluar(expresion));
  } catch {
    tokens = [];
    valorActual = "0";
    valorIntroducido = false;
    resultadoMostrado = false;
    estadoError = true;
    pantalla.value = "Error";
    return;
  }

  const cuenta = {
    expresion: expresion.join("").replace(/\./g, ","),
    resultado: resultado.replace(/\./g, ","),
    valor: resultado
  };

  valorActual = resultado;
  tokens = [];
  valorIntroducido = true;
  resultadoMostrado = true;
  actualizarPantalla();
  guardarUltimaCuenta(cuenta);
}

function evaluar(expresion) {
  let posicion = 0;

  function leerNumero() {
    const token = expresion[posicion];
    if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(token || "")) {
      throw new Error("Expresión no válida");
    }

    posicion += 1;
    const numero = Number(token);
    if (!Number.isFinite(numero)) {
      throw new Error("Número no válido");
    }
    return numero;
  }

  function leerTermino() {
    let resultado = leerNumero();

    while (expresion[posicion] === "*" || expresion[posicion] === "/") {
      const operador = expresion[posicion];
      posicion += 1;
      const siguiente = leerNumero();

      if (operador === "/" && siguiente === 0) {
        throw new Error("No se puede dividir entre cero");
      }

      resultado = operador === "*" ? resultado * siguiente : resultado / siguiente;
    }

    return resultado;
  }

  let resultado = leerTermino();
  while (expresion[posicion] === "+" || expresion[posicion] === "-") {
    const operador = expresion[posicion];
    posicion += 1;
    const siguiente = leerTermino();
    resultado = operador === "+" ? resultado + siguiente : resultado - siguiente;
  }

  if (posicion !== expresion.length || !Number.isFinite(resultado)) {
    throw new Error("Expresión no válida");
  }

  return resultado;
}

function formatearNumero(numero) {
  const redondeado = Number(numero.toPrecision(12));
  return Object.is(redondeado, -0) ? "0" : String(redondeado);
}

function cargarUltimaCuenta() {
  try {
    const guardada = window.localStorage.getItem(claveUltimaCuenta);
    if (guardada === null) {
      return null;
    }

    const cuenta = JSON.parse(guardada);
    if (
      typeof cuenta.expresion !== "string" ||
      typeof cuenta.resultado !== "string" ||
      typeof cuenta.valor !== "string" ||
      cuenta.valor.trim() === "" ||
      !Number.isFinite(Number(cuenta.valor))
    ) {
      throw new Error("La última cuenta guardada no es válida.");
    }

    return cuenta;
  } catch {
    actualizarEstadoMemoria("No se pudo leer la última cuenta guardada en este navegador.");
    return null;
  }
}

function guardarUltimaCuenta(cuenta) {
  ultimaCuenta = cuenta;
  actualizarVistaUltimaCuenta();

  try {
    window.localStorage.setItem(claveUltimaCuenta, JSON.stringify(cuenta));
    actualizarEstadoMemoria("La cuenta se ha guardado en este navegador.");
  } catch {
    actualizarEstadoMemoria("No se pudo guardar en el navegador; estará disponible hasta cerrar esta página.");
  }
}

function actualizarVistaUltimaCuenta() {
  if (ultimaCuenta === null) {
    ultimaCuentaTexto.textContent = "Todavía no hay ninguna cuenta guardada.";
    return;
  }

  ultimaCuentaTexto.textContent = `${ultimaCuenta.expresion} = ${ultimaCuenta.resultado}`;
}

function actualizarEstadoMemoria(mensaje) {
  estadoMemoria.textContent = mensaje;
}

function borrarUltimaCuenta() {
  ultimaCuenta = null;
  actualizarVistaUltimaCuenta();

  try {
    window.localStorage.removeItem(claveUltimaCuenta);
    actualizarEstadoMemoria("Se ha borrado la última cuenta con CE.");
  } catch {
    actualizarEstadoMemoria("No se pudo borrar la cuenta guardada del navegador.");
  }
}

ultimaCuenta = cargarUltimaCuenta();
actualizarVistaUltimaCuenta();
