import React, { useState, useMemo, useEffect } from "react";
import { MapPin, X, MessageCircle, Store, ChevronRight, Tag, Check, Lock, SlidersHorizontal, UserRound, LogIn, Settings, CircleHelp, Headphones, Info, Home, Search, Plus, Package, MoreHorizontal, Flame, BadgeCheck, Truck, Eye,
EyeOff, LogOut, Heart, Share2, ImageIcon, ShoppingCart, } from "lucide-react";
window.onerror = function (mensaje, archivo, linea, columna, error) {
  document.body.innerHTML = `
    <div style="
      padding:20px;
      background:#111;
      color:#ff6b6b;
      font-family:monospace;
      min-height:100vh;
      white-space:pre-wrap;
    ">
      <h2 style="color:white;">ERROR DE MERCADOCU</h2>

      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>

      <p><strong>Archivo:</strong></p>
      <p>${archivo}</p>

      <p><strong>Línea:</strong> ${linea}</p>

      <p><strong>Columna:</strong> ${columna}</p>

      <p><strong>Error:</strong></p>
      <p>${error ? error.stack : "Sin información adicional"}</p>
    </div>
  `;
};

window.onunhandledrejection = function (event) {
  document.body.innerHTML = `
    <div style="
      padding:20px;
      background:#111;
      color:#ff6b6b;
      font-family:monospace;
      min-height:100vh;
      white-space:pre-wrap;
    ">
      <h2 style="color:white;">ERROR DE MERCADOCU</h2>

      <p><strong>Promesa rechazada:</strong></p>

      <p>${
        event.reason?.stack ||
        event.reason ||
        "Error desconocido"
      }</p>
    </div>
  `;
};

const PROVINCIAS = [
  "Todas", "Pinar del Río" , "Artemisa" , "La Habana", "Mayabeque" , "Matanzas" , "Cienfuegos" , "Villa Clara" , "Sansti Spiritu" , "Ciego de Ávila",
  "Camagüey", "Holguín", "Granma" , "Santiago de Cuba" , "Guantánamo" , "Isla de la Juventud"
];

const CATEGORIAS = [
  "Todas", "Electrónica", "Ropa y calzado", "Hogar", "Alimentos", "Belleza", "Vehículos"
];

const TASAS_CAMBIO = {
  USD: 0,
  EUR: 0,
};

function convertirACUP(precio, moneda) {
  const m = String(moneda).trim().toUpperCase();

  if (m === "USD") return precio * TASAS_CAMBIO.USD;
  if (m === "EUR" || m === "EURO" || m === "€") return precio * TASAS_CAMBIO.EUR;
  if (m === "CUP") return precio;

  return precio;
}

const API_URL =
  "https://script.google.com/macros/s/AKfycby16A5ELOrZAE2QubflsJp9j6EQx34erkLCPD4TcIL18RvvDVCU5yVbOFZMn-Tfe0UU/exec";

function mapearProducto(fila, index) {
  const foto = String(fila?.["Foto del Producto"] || "");

  let fotosDirectas = [];

  // Separar varias fotos usando ||
  fotosDirectas = foto
    .split("||")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => {
      if (url.includes("drive.google.com/file/d/")) {
        const partes = url.split("/d/");

        if (partes[1]) {
          const id = partes[1].split("/")[0];

          return "https://drive.google.com/uc?export=view&id=" + id;
        }
      }

      return url;
    });

  return {
    id: index,
    _fila: fila?._fila || "",
    nombre: fila?.["Nombre del producto"] || "",
    categoria: fila?.["Categoría"] || "",
    provincia: fila?.["Provincia"] || "",
    precio: fila?.["Precio"] || "",
    moneda: fila?.["Moneda"] || "",
    vendedor:
      fila?.["Tu nombre (como quieres que aparezca en el anuncio)"] || "",
    tel: fila?.["Tu número de WhatsApp"] || "",

    // Primera foto: compatibilidad con el código actual
    foto: fotosDirectas[0] || "",

    // Todas las fotos: para el carrusel
    fotos: fotosDirectas,

        estado: fila?.["Estado"] || "EN VENTA",
    idVendedor: fila?.["ID vendedor"] || "",
    fechaPublicacion: fila?.["Marca temporal"] || "",

    // CONTADORES DE INTERACCIONES
    visualizaciones: Number(fila?.visualizaciones || 0),
    meGusta: Number(fila?.meGusta || 0),
    guardados: Number(fila?.guardados || 0),
  };
}

function CarruselFotos({ fotos, nombre }) {
  const [fotoActual, setFotoActual] = useState(0);

  if (!fotos || fotos.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full bg-[#0B0F11] overflow-hidden">

      {/* CARRUSEL HORIZONTAL */}
      <div
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onScroll={(e) => {
          const ancho = e.currentTarget.clientWidth;

          if (ancho > 0) {
            const indice = Math.round(
              e.currentTarget.scrollLeft / ancho
            );

            setFotoActual(indice);
          }
        }}
      >

        {fotos.map((foto, index) => (
          <div
            key={index}
            className="min-w-full snap-center flex items-center justify-center"
          >
            <div className="aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center">
              <img
  src={foto.replace(
    "uc?export=view&id=",
    "thumbnail?sz=w1000&id="
  )}
  onError={(e) => {
    e.currentTarget.src = foto;
  }}
  alt={`${nombre} - foto ${index + 1}`}
  className="w-full h-full object-contain"
/>
            </div>
          </div>
        ))}

      </div>

      {/* INDICADORES */}
      {fotos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {fotos.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === fotoActual
                  ? "w-5 bg-white"
                  : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* BORDE INFERIOR */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2A3033]" />

    </div>
  );
    }

function EtiquetaPrecio({ precio, moneda }) {
  return (
    <div className="inline-flex items-center bg-[#7EE2C0] text-[#0D1113] px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold shadow-[0_4px_14px_rgba(126,226,192,0.12)]">
      <span>{precio} {moneda}</span>
    </div>
  );
}

function PanelAdmin() {
  const [clave, setClave] = useState("");
  const [claveIngresada, setClaveIngresada] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [usd, setUsd] = useState("");
const [eur, setEur] = useState("");
const [guardandoMonedas, setGuardandoMonedas] = useState(false);

  const cargarProductos = (claveActual) => {
    setCargando(true);
    fetch(`${API_URL}?accion=listar&clave=${encodeURIComponent(claveActual)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Clave incorrecta");
          setAutenticado(false);
        } else {
          setProductos(data);
          setAutenticado(true);
        }
        setCargando(false);
      })
      .catch(() => {
        alert("No se pudo conectar. Revisa tu conexión.");
        setCargando(false);
      });
  };

  const entrar = () => {
    setClaveIngresada(clave);
    cargarProductos(clave);
  };

  const decidir = (fila, valor) => {
    setProcesando(fila);
    const url = `${API_URL}?accion=decidir&clave=${encodeURIComponent(claveIngresada)}&fila=${fila}&valor=${valor}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          setProductos((prev) => prev.filter((p) => p._fila !== fila));
        }
        setProcesando(null);
      })
      .catch(() => {
        alert("No se pudo guardar. Intenta de nuevo.");
        setProcesando(null);
      });
  };

  const actualizarMonedas = () => {
  setGuardandoMonedas(true);

  const url = `${API_URL}?accion=actualizarMonedas&clave=${encodeURIComponent(claveIngresada)}&usd=${usd}&eur=${eur}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Tasas actualizadas correctamente");
      }
      setGuardandoMonedas(false);
    })
    .catch(() => {
      alert("No se pudieron actualizar las monedas");
      setGuardandoMonedas(false);
    });
};

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#EDE6D6] flex items-center justify-center p-5">
        <div className="bg-white rounded-sm shadow-md p-6 w-full max-w-sm text-center">
          <Lock className="w-8 h-8 mx-auto text-[#1B6B63] mb-3" />
          <h2 className="font-bold text-lg mb-3">Panel del propietario</h2>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Escribe tu clave"
            className="w-full border border-[#ddd6c4] rounded-sm px-3 py-2 text-sm mb-3"
          />
          <button
            onClick={entrar}
            disabled={cargando}
            className="w-full bg-[#1B6B63] text-white font-semibold py-2 rounded-sm hover:bg-[#155650] transition-colors"
          >
            {cargando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  const pendientes = productos.filter((p) => !p["Aprobado"]);

  return (
    <div className="min-h-screen bg-[#EDE6D6] p-5">
      <div className="bg-white rounded-sm border border-[#e5dfd0] p-4 mb-5 max-w-xl">
  <h2 className="font-bold text-lg mb-3">
    Configuración de monedas
  </h2>

  <div className="flex gap-3 mb-3">
    <div className="flex-1">
      <label className="text-sm text-[#5c5848]">
        USD en CUP
      </label>
      <input
        type="number"
        value={usd}
        onChange={(e) => setUsd(e.target.value)}
        className="w-full border border-[#ddd6c4] rounded-sm px-3 py-2"
        placeholder="680"
      />
    </div>

    <div className="flex-1">
      <label className="text-sm text-[#5c5848]">
        EUR en CUP
      </label>
      <input
        type="number"
        value={eur}
        onChange={(e) => setEur(e.target.value)}
        className="w-full border border-[#ddd6c4] rounded-sm px-3 py-2"
        placeholder="700"
      />
    </div>
  </div>

  <button
    onClick={actualizarMonedas}
    disabled={guardandoMonedas}
    className="w-full bg-[#1B6B63] text-white font-semibold py-2 rounded-sm"
  >
    {guardandoMonedas ? "Guardando..." : "Actualizar monedas"}
  </button>
</div>
      <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        PRODUCTOS PENDIENTES
      </h1>
      <p className="text-sm text-[#5c5848] mb-5">{pendientes.length} esperando tu aprobación</p>

      {pendientes.length === 0 ? (
        <div className="bg-white rounded-sm p-8 text-center text-[#8a8370] text-sm">
          No hay productos pendientes por ahora.
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-xl">
          {pendientes.map((p) => (
            <div key={p._fila} className="bg-white rounded-sm border border-[#e5dfd0] p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-[#1B6B63] bg-[#e6efec] px-3 py-1 rounded-full">
                  {p["Categoría"]}
                </span>
                <span className="text-[11px] text-[#8a8370]">{p["Provincia"]}</span>
              </div>
              <h3 className="font-semibold text-[15px]">{p["Nombre del producto"]}</h3>
              {p["Foto del Producto"] && (
  <div className="w-full h-48 rounded-xl flex items-center justify-center bg-white overflow-x-auto mt-3">
    <div className="flex gap-2 h-full">

      {String(p["Foto del Producto"])
        .split("||")
        .map((url, index) => {
          const foto = url.trim();

          if (!foto) return null;

          let fotoDirecta = foto;

          if (foto.includes("drive.google.com/file/d/")) {
            const partes = foto.split("/d/");

            if (partes[1]) {
              const id = partes[1].split("/")[0];

              fotoDirecta =
                "https://drive.google.com/uc?export=view&id=" + id;
            }
          }

          return (
            <div
              key={index}
              className="h-full min-w-[240px] flex items-center justify-center bg-[#F7F5EF] rounded-lg overflow-hidden"
            >
              <img
                src={fotoDirecta.replace(
                  "uc?export=view&id=",
                  "thumbnail?sz=w1000&id="
                )}
                onError={(e) => {
                  e.currentTarget.src = fotoDirecta;
                }}
                alt={`${p["Nombre del producto"]} - foto ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}

    </div>
  </div>
)}
              <p className="text-sm text-[#5c5848] mt-1">
                {p["Precio"]} {p["Moneda"]} · Vendedor: {p["Tu nombre (como quieres que aparezca en el anuncio)"]}
              </p>
              <p className="text-xs text-[#8a8370] mt-1">WhatsApp: {p["Tu número de WhatsApp"]}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => decidir(p._fila, "SI")}
                  disabled={procesando === p._fila}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#1B6B63] hover:bg-[#155650] text-white text-sm font-semibold py-2 rounded-sm transition-colors"
                >
                  <Check className="w-4 h-4" /> Aprobar
                </button>
                <button
                  onClick={() => decidir(p._fila, "NO")}
                  disabled={procesando === p._fila}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#C4472B] hover:bg-[#a83a23] text-white text-sm font-semibold py-2 rounded-sm transition-colors"
                >
                  <X className="w-4 h-4" /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tienda() {
  const [publicarAbierto, setPublicarAbierto] = useState(false);
  const [opcionesPublicar, setOpcionesPublicar] = useState(false);
  const [provincia, setProvincia] = useState("Todas");
    const [misProductosAbierto, setMisProductosAbierto] = useState(false);
  const [buscarAbierto, setBuscarAbierto] = useState(false);
  const [productoDestino, setProductoDestino] = useState(null);
  const [productoDestacado, setProductoDestacado] = useState(null);
  const [whatsappLogin, setWhatsappLogin] = useState("");
  const [misProductos, setMisProductos] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(() => {
  const guardado = localStorage.getItem("mercadoCU_usuario");
  return guardado ? JSON.parse(guardado) : null;
});
  const obtenerIdentidadDispositivo = () => {
  let dispositivo = localStorage.getItem("mercadoCU_dispositivo");

  if (!dispositivo) {
    dispositivo =
      "DISP-" +
      Math.random().toString(36).substring(2, 10).toUpperCase();

    localStorage.setItem(
      "mercadoCU_dispositivo",
      dispositivo
    );
  }

  return dispositivo;
};
  const obtenerIdentidadInteraccion = () => {
  if (usuarioActual?.idVendedor) {
    return usuarioActual.idVendedor;
  }

  return obtenerIdentidadDispositivo();
};
  const obtenerClaveGuardados = () =>
  `mercadoCU_productos_guardados_${obtenerIdentidadInteraccion()}`;

const obtenerClaveMeGusta = () =>
  `mercadoCU_productos_me_gusta_${obtenerIdentidadInteraccion()}`;
  const [productosGuardados, setProductosGuardados] = useState([]);

const [productosMeGusta, setProductosMeGusta] = useState([]);
  useEffect(() => {
  const guardados = localStorage.getItem(
    obtenerClaveGuardados()
  );

  const meGusta = localStorage.getItem(
    obtenerClaveMeGusta()
  );

  setProductosGuardados(
    guardados ? JSON.parse(guardados) : []
  );

  setProductosMeGusta(
    meGusta ? JSON.parse(meGusta) : []
  );
}, [usuarioActual]);
  const [avisoGuardado, setAvisoGuardado] = useState(false);
  const [cargandoMisProductos, setCargandoMisProductos] = useState(false);
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  useEffect(() => {
  if (seleccionado) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [seleccionado]);
  const [productos, setProductos] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [tendenciasAbierto, setTendenciasAbierto] = useState(false);
  const [accesoPublicarAbierto, setAccesoPublicarAbierto] = useState(false);
  const [crearCuentaAbierto, setCrearCuentaAbierto] = useState(false);
  const [volverA, setVolverA] = useState("inicio");
  const [iniciarSesionAbierto, setIniciarSesionAbierto] = useState(false);
const [whatsappSesion, setWhatsappSesion] = useState("");
const [pinSesion, setPinSesion] = useState("");
const [mostrarPinSesion, setMostrarPinSesion] = useState(false);
const [sesionError, setSesionError] = useState("");
const [cargandoSesion, setCargandoSesion] = useState(false);
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [registroPaso, setRegistroPaso] = useState(1);
  const [nombreRegistro, setNombreRegistro] = useState("");
const [whatsappRegistro, setWhatsappRegistro] = useState("");
const [pinRegistro, setPinRegistro] = useState("");
  const [confirmarPinRegistro, setConfirmarPinRegistro] = useState("");
const [mostrarPin, setMostrarPin] = useState(false);
  const [registroError, setRegistroError] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [orden, setOrden] = useState("recientes");
  const [moneda, setMoneda] = useState("Todas");
  const [tasas, setTasas] = useState({
  USD: 680,
  EUR: 700,
});

  const [nombreProducto, setNombreProducto] = useState("");
const [categoriaProducto, setCategoriaProducto] = useState("");
const [provinciaProducto, setProvinciaProducto] = useState("");
const [monedaProducto, setMonedaProducto] = useState("");
const [precioProducto, setPrecioProducto] = useState("");
const [whatsappProducto, setWhatsappProducto] = useState("");
const [imagenesProducto, setImagenesProducto] = useState([]);
  const [enviandoProducto, setEnviandoProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
const [editandoProducto, setEditandoProducto] = useState(false);
  const [visualizacionesRegistradas, setVisualizacionesRegistradas] = useState(
  () => new Set()
);
  useEffect(() => {
  let sesion = localStorage.getItem("mercadoCU_sesion");

  if (!sesion) {
    sesion =
      "SES-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).substring(2, 8);

    localStorage.setItem("mercadoCU_sesion", sesion);
  }
}, []);
  
  const iniciarSesion = async () => {
  if (!whatsappSesion || !pinSesion) {
    setSesionError("Escribe tu WhatsApp y contraseña");
    return;
  }

  setCargandoSesion(true);
  setSesionError("");

  try {
    const respuesta = await fetch(
      `${API_URL}?accion=iniciarSesion&whatsapp=${encodeURIComponent(
        whatsappSesion
      )}&pin=${encodeURIComponent(pinSesion)}`
    );

    const resultado = await respuesta.json();

    if (resultado.exito) {
      localStorage.setItem(
        "mercadoCU_usuario",
        JSON.stringify(resultado.usuario)
      );
      setUsuarioActual(resultado.usuario);

      setIniciarSesionAbierto(false);
      setWhatsappSesion("");
      setPinSesion("");
      setSesionError("");

      alert(`¡Bienvenido ${resultado.usuario.nombre}!`);
    } else {
      setSesionError(
        resultado.error || "No se pudo iniciar sesión"
      );
    }

  } catch (error) {
    console.error(error);

    setSesionError(
      "No se pudo conectar con el servidor."
    );

  } finally {
    setCargandoSesion(false);
  }
};
 const registrarInteraccion = async ({
  tipo,
  producto = null,
  identificador = "",
  termino = "",
  resultadoBusqueda = "",
  duracion = "",
  esUnica = ""
}) => {
  try {

    const identidad = obtenerIdentidadInteraccion();

    const respuesta = await fetch(
      `${API_URL}?accion=registrarInteraccion` +
      `&idProducto=${encodeURIComponent(
        producto?._fila || producto?.id || ""
      )}` +
      `&tipo=${encodeURIComponent(tipo)}` +
      `&identificador=${encodeURIComponent(identificador)}` +
      `&provincia=${encodeURIComponent(
        producto?.provincia || ""
      )}` +
      `&termino=${encodeURIComponent(termino)}` +
      `&resultadoBusqueda=${encodeURIComponent(
        resultadoBusqueda
      )}` +
      `&estadoProducto=${encodeURIComponent(
        producto?.estado || ""
      )}` +
      `&idVendedor=${encodeURIComponent(
        producto?.idVendedor || ""
      )}` +

      // ID SESION SE CONSERVA COMO ESTABA
      `&idSesion=${encodeURIComponent(
        localStorage.getItem("mercadoCU_sesion") || ""
      )}` +

      // NUEVA IDENTIDAD PARA CONTROLAR INTERACCIONES
      `&identidad=${encodeURIComponent(
        identidad
      )}` +

      `&duracion=${encodeURIComponent(duracion)}` +
      `&fechaPublicacion=${encodeURIComponent(
        producto?.fechaPublicacion || ""
      )}` +
      `&fechaVenta=${encodeURIComponent(
        producto?.fechaVenta || ""
      )}` +
      `&diasHastaVenta=${encodeURIComponent(
        producto?.diasHastaVenta || ""
      )}` +
      `&esUnica=${encodeURIComponent(esUnica)}`
    );

  } catch (error) {

    console.error(
      "Error registrando interacción:",
      error
    );

  }
};
  const buscarMisProductos = async () => {
  if (!usuarioActual) {
    setMisProductosAbierto(false);
    setVolverA("inicio");
    setCrearCuentaAbierto(true);
    return;
  }

  setMisProductosAbierto(true);
    setCargandoMisProductos(true);

  try {
    const respuesta = await fetch(
      `${API_URL}?accion=misProductos&whatsapp=${encodeURIComponent(usuarioActual.whatsapp)}`
    );

    const datos = await respuesta.json();

    setMisProductos(datos);

  } catch (error) {
    alert("No se pudieron cargar tus productos");
  }

  setCargandoMisProductos(false);
};
 const alternarProductoGuardado = (producto) => {
  setProductosGuardados((actuales) => {
    const existe = actuales.some(
      (p) => p._fila === producto._fila
    );

    // =========================================
    // YA ESTABA GUARDADO → QUITAR
    // =========================================

    if (existe) {
      const nuevos = actuales.filter(
        (p) => p._fila !== producto._fila
      );

      localStorage.setItem(
        obtenerClaveGuardados(),
        JSON.stringify(nuevos)
      );

      // Registrar que se quitó el guardado
registrarInteraccion({
  tipo: "QUITA_GUARDADO",
  producto: producto,
  identificador: "GUARDADO",
  esUnica: "NO"
});

      // Actualizar contador visual
      setProductos((productosActuales) =>
        productosActuales.map((p) =>
          p._fila === producto._fila
            ? {
                ...p,
                guardados: Math.max(
                  0,
                  Number(p.guardados || 0) - 1
                )
              }
            : p
        )
      );

      return nuevos;
    }

    // =========================================
    // NO ESTABA GUARDADO → GUARDAR
    // =========================================

    const nuevos = [...actuales, producto];

    localStorage.setItem(
      obtenerClaveGuardados(),
      JSON.stringify(nuevos)
    );

    // Registrar GUARDADO como métrica
    registrarInteraccion({
      tipo: "GUARDADO",
      producto: producto,
      identificador: "GUARDADO",
      esUnica: "SI"
    });

    // Actualizar contador visual
    setProductos((productosActuales) =>
      productosActuales.map((p) =>
        p._fila === producto._fila
          ? {
              ...p,
              guardados:
                Number(p.guardados || 0) + 1
            }
          : p
      )
    );

    // Mostrar aviso solamente al guardar
    setAvisoGuardado(true);

    setTimeout(() => {
      setAvisoGuardado(false);
    }, 2500);

    return nuevos;
  });
};
 const alternarMeGusta = (producto) => {
  setProductosMeGusta((actuales) => {
    const existe = actuales.some(
      (p) => p._fila === producto._fila
    );

    let nuevos;

    if (existe) {
      nuevos = actuales.filter(
        (p) => p._fila !== producto._fila
      );

      registrarInteraccion({
        tipo: "QUITA_ME_GUSTA",
        producto: producto,
        identificador: "CORAZON",
        esUnica: "NO"
      });

      // Actualizar contador visual
      setProductos((productosActuales) =>
        productosActuales.map((p) =>
          p._fila === producto._fila
            ? {
                ...p,
                meGusta: Math.max(
                  0,
                  Number(p.meGusta || 0) - 1
                )
              }
            : p
        )
      );

    } else {
      nuevos = [...actuales, producto];

      registrarInteraccion({
        tipo: "ME_GUSTA",
        producto: producto,
        identificador: "CORAZON",
        esUnica: "SI"
      });

      // Actualizar contador visual
      setProductos((productosActuales) =>
        productosActuales.map((p) =>
          p._fila === producto._fila
            ? {
                ...p,
                meGusta:
                  Number(p.meGusta || 0) + 1
              }
            : p
        )
      );
    }

    localStorage.setItem(
      obtenerClaveMeGusta(),
      JSON.stringify(nuevos)
    );

    return nuevos;
  });
};
  const eliminarProducto = async (fila) => {

  const confirmar = window.confirm(
    "¿Seguro que quieres eliminar este producto?"
  );

  if (!confirmar) return;

  try {

    const respuesta = await fetch(
      `${API_URL}?accion=eliminarProducto&fila=${fila}`
    );

    const resultado = await respuesta.json();

    if (resultado.exito) {

  setMisProductos(
    prev => prev.filter((p) => p._fila !== fila)
  );

  setProductos(
    prev => prev.filter((p) => p._fila !== fila)
  );

  alert("Producto eliminado");

    } else {

      alert("No se pudo eliminar");

    }

  } catch (error) {

    alert("Error al eliminar");

  }

};
  const abrirEdicion = (producto) => {
  setProductoEditando(producto);
  setNombreProducto(producto["Nombre del producto"] || "");
  setCategoriaProducto(producto["Categoría"] || "Electrónica");
  setProvinciaProducto(producto["Provincia"] || "La Habana");
  setMonedaProducto(producto["Moneda"] || "CUP");
  setPrecioProducto(producto["Precio"] || "");
  setEditandoProducto(true);
};
  const marcarReservado = async (fila) => {

  try {

    const respuesta = await fetch(
      `${API_URL}?accion=marcarReservado&fila=${fila}`
    );

    const resultado = await respuesta.json();

    if (resultado.exito) {

      setMisProductos(
        prev => prev.map((p) =>
          p._fila === fila
            ? { ...p, Estado: "Reservado" }
            : p
        )
      );

      setProductos(
        prev => prev.map((p) =>
          p._fila === fila
            ? { ...p, estado: "Reservado" }
            : p
        )
      );

      alert("Producto marcado como reservado");

    } else {

      alert("No se pudo marcar como reservado");

    }

  } catch (error) {

    alert("Error al marcar el producto como reservado");

  }

};
 const marcarVendido = async (fila) => {

  try {

    const respuesta = await fetch(
      `${API_URL}?accion=marcarVendido&fila=${fila}`
    );

    const resultado = await respuesta.json();

    if (resultado.exito) {

      setMisProductos(
        prev => prev.map((p) =>
          p._fila === fila
            ? { ...p, Estado: "Vendido" }
            : p
        )
      );

      setProductos(
        prev => prev.map((p) =>
          p._fila === fila
            ? { ...p, estado: "Vendido" }
            : p
        )
      );

      alert("Producto marcado como vendido");

    } else {

      alert("No se pudo marcar como vendido");

    }

  } catch (error) {

    alert("Error al marcar el producto como vendido");

  }

};
  const marcarEnVenta = async (fila) => {

  try {

    const respuesta = await fetch(
      `${API_URL}?accion=marcarEnVenta&fila=${fila}`
    );

    const resultado = await respuesta.json();

    if (resultado.exito) {

      setMisProductos(
        prev => prev.map((p) =>
          p._fila === fila
            ? { ...p, Estado: "En venta" }
            : p
        )
      );

      setProductos(
        prev => prev.map((p) =>
          p._fila === fila
            ? { ...p, estado: "En venta" }
            : p
        )
      );

      alert("Producto puesto nuevamente en venta");

    } else {

      alert("No se pudo poner el producto en venta");

    }

  } catch (error) {

    alert("Error al poner el producto en venta");

  }

};


      const enviarProducto = async () => {
  if (
    !usuarioActual ||
    !nombreProducto ||
    !precioProducto ||
    imagenesProducto.length === 0
  ) {
    alert("Completa todos los campos y selecciona al menos una foto");
    return;
  }

  setEnviandoProducto(true);

  try {
    const fotosBase64 = [];

    // Convertir cada foto a Base64
    for (const imagen of imagenesProducto) {
  const base64 = await new Promise((resolve, reject) => {

    const lector = new FileReader();

    lector.onload = () => {
      const img = new Image();

      img.onload = () => {

        const MAX_ANCHO = 1200;
        const MAX_ALTO = 1200;

        let ancho = img.width;
        let alto = img.height;

        if (ancho > MAX_ANCHO || alto > MAX_ALTO) {

          const proporcion = Math.min(
            MAX_ANCHO / ancho,
            MAX_ALTO / alto
          );

          ancho = Math.round(ancho * proporcion);
          alto = Math.round(alto * proporcion);
        }

        const canvas = document.createElement("canvas");

        canvas.width = ancho;
        canvas.height = alto;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, ancho, alto);

        const comprimida = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        resolve({
          imagen: comprimida.split(",")[1],
          tipo: "image/jpeg",
          nombre: imagen.name.replace(/\.[^/.]+$/, "") + ".jpg"
        });
      };

      img.onerror = reject;

      img.src = lector.result;
    };

    lector.onerror = reject;

    lector.readAsDataURL(imagen);
  });

  fotosBase64.push(base64);
  }

    const datos = {
      nombreProducto: nombreProducto,
      categoria: categoriaProducto,
      provincia: provinciaProducto,
      moneda: monedaProducto,
      precio: precioProducto,

      whatsapp: usuarioActual.whatsapp,
      nombreVendedor: usuarioActual.nombre,
      idVendedor: usuarioActual.idVendedor,

      imagenes: JSON.stringify(fotosBase64)
    };

    const formulario = new URLSearchParams();

    Object.keys(datos).forEach((clave) => {
      formulario.append(clave, datos[clave]);
    });

    alert("1. Fotos preparadas. Voy a enviar al servidor.");

const respuesta = await fetch(
  API_URL,
  {
    method: "POST",
    body: formulario
  }
);

alert("2. El servidor respondió.");

const resultado = await respuesta.json();

alert("3. Respuesta recibida: " + JSON.stringify(resultado));

    if (resultado.exito) {
      alert("Producto enviado para aprobación");

      setPublicarAbierto(false);

      setNombreProducto("");
      setCategoriaProducto("");
      setProvinciaProducto("");
      setMonedaProducto("");
      setPrecioProducto("");
      setImagenesProducto([]);

    } else {
      alert("Error: " + JSON.stringify(resultado));
    }

  } catch (error) {
    alert("ERROR REAL: " + error.toString());

  } finally {
    setEnviandoProducto(false);
  }
};
  useEffect(() => {
  fetch(`${API_URL}?accion=aprobados`)
    .then((res) => res.json())
    .then((data) => {
      console.log("APROBADOS:", data);

      if (!Array.isArray(data)) {
        console.error("APROBADOS NO ES UN ARRAY:", data);
        setProductos([]);
        return;
      }

      const productosMapeados = data.map((fila, index) =>
        mapearProducto(fila, index)
      );

      console.log("PRODUCTOS MAPEADOS:", productosMapeados);

            setProductos(productosMapeados);
    })
    .catch((error) => {
      console.error("ERROR CARGANDO PRODUCTOS:", error);
      setProductos([]);
    });

  fetch(`${API_URL}?accion=monedas`)
    .then((res) => res.json())
    .then((data) => {
      setTasas({
        USD: data.USD,
        EUR: data.EUR,
      });

          TASAS_CAMBIO.USD = data.USD;
TASAS_CAMBIO.EUR = data.EUR;
    })
    .catch(() => {});
}, []);
  useEffect(() => {
  if (!productoDestino) return;

  const elemento = document.getElementById(`producto-${productoDestino.id}`);

  if (elemento) {
    const rect = elemento.getBoundingClientRect();
    const y =
      rect.top +
      window.scrollY -
      (window.innerHeight / 2) +
      (rect.height / 2);

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    setTimeout(() => {
      setProductoDestacado(productoDestino.id);

      setTimeout(() => {
        setProductoDestacado(null);
      }, 1800);
    }, 500);

    setProductoDestino(null);
  }
}, [productoDestino]);

  const productosFiltrados = useMemo(() => {
  let resultado = productos.filter(p => {
    const okProvincia =
      provincia === "Todas" ||
      p.provincia?.trim().toLowerCase() === provincia.trim().toLowerCase();

    const okCategoria =
      categoria === "Todas" ||
      p.categoria?.trim() === categoria.trim();

    const okBusqueda =
      busqueda.trim() === "" ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const okMoneda =
      moneda === "Todas" ||
      p.moneda?.trim().toUpperCase() === moneda;

    return okProvincia && okCategoria && okBusqueda && okMoneda;
  });

  if (orden === "precioMenor") {
  resultado.sort((a, b) => {
    return convertirACUP(a.precio, a.moneda) - convertirACUP(b.precio, b.moneda);
  });
}

if (orden === "precioMayor") {
  resultado.sort((a, b) => {
    return convertirACUP(b.precio, b.moneda) - convertirACUP(a.precio, a.moneda);
  });
}

  return resultado;
}, [productos, provincia, categoria, busqueda, orden, moneda]);

  useEffect(() => {
  if (!productosFiltrados.length) return;

  const observadores = [];

  productosFiltrados.forEach((producto) => {
    const elemento = document.getElementById(
      `producto-${producto.id}`
    );

    if (!elemento) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;

          const idProducto = producto._fila;

          if (!idProducto) return;

          if (visualizacionesRegistradas.has(idProducto)) {
            return;
          }

          setVisualizacionesRegistradas((actuales) => {
            const nuevos = new Set(actuales);

            if (nuevos.has(idProducto)) {
              return actuales;
            }

            nuevos.add(idProducto);
            return nuevos;
          });

          registrarInteraccion({
            tipo: "VISUALIZACION",
            producto: producto,
            identificador: "OJO",
            esUnica: "SI"
          });

          observador.unobserve(elemento);
        });
      },
      {
        threshold: 0.5
      }
    );

    observador.observe(elemento);
    observadores.push({ observador, elemento });
  });

  return () => {
    observadores.forEach(({ observador, elemento }) => {
      observador.unobserve(elemento);
      observador.disconnect();
    });
  };
}, [productosFiltrados, visualizacionesRegistradas]);
  return (
  <div
    className="min-h-screen bg-[#0D1113] text-[#F2F4F5]"
    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
  >
    {avisoGuardado && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
    <div className="bg-[#202629] border border-[#2A3033] text-[#F2F4F5] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
      <span className="text-[#7EE2C0] font-bold">✓</span>
      <span className="text-sm font-semibold">
        Producto guardado
      </span>
    </div>
  </div>
)}
      <header className="relative bg-[#151A1D] text-[#F2F4F5] border-b border-[#2A3033]">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5">
  <div className="w-9 h-9 rounded-xl bg-[#1B6B63] flex items-center justify-center shadow-lg">
    <Store className="w-5 h-5 text-white" strokeWidth={2.2} />
  </div>

  <span
    className="text-2xl tracking-tight font-extrabold"
    style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      letterSpacing: "-0.04em"
    }}
  >
    Mercado<span className="text-[#E8A33D]">CU</span>
  </span>
</div>
            </div>
          <button
 onClick={() => {
  if (!usuarioActual) {
    setAccesoPublicarAbierto(true);
    return;
  }

  setPublicarAbierto(true);
}}
  className="flex items-center gap-1.5 bg-[#1B6B63] hover:bg-[#237D73] active:scale-95 transition-all text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-[0_5px_18px_rgba(27,107,99,0.28)]"
>
  <Plus className="w-4 h-4" strokeWidth={2.5} />
  Publicar
</button>

            <div className="flex items-center gap-2">
  <button
    onClick={() => setMenuAbierto(!menuAbierto)}
    className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
  >
    {usuarioActual ? (
      <>
        <div className="w-10 h-10 rounded-full bg-[#1B6B63] text-white flex items-center justify-center text-xs font-bold border border-[#3A474B] shadow-lg">
          {usuarioActual.nombre
            ? usuarioActual.nombre
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((parte) => parte[0])
                .join("")
                .toUpperCase()
            : "U"}
        </div>

        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#35C759] border-2 border-[#151A1D] rounded-full" />
      </>
    ) : (
      <div className="w-10 h-10 rounded-full bg-[#202629] border border-[#3A474B] flex items-center justify-center text-[#9AA6AD]">
        <UserRound className="w-5 h-5" />
      </div>
    )}
  </button>
</div>

  {menuAbierto && (
    <div className="fixed inset-x-0 bottom-0 bg-[#151A1D] text-[#F2F4F5] rounded-t-3xl shadow-2xl p-5 z-50 max-h-[85vh] overflow-y-auto border-t border-[#2A3033]">
<div className="flex items-center justify-between mb-5">
  <div>
    <p className="text-xs uppercase tracking-wider text-[#7EE2C0] font-semibold">
      MercadoCU
    </p>
    <h2 className="text-2xl font-bold text-[#F2F4F5]">
      Más
    </h2>
  </div>

  <button
    onClick={() => setMenuAbierto(false)}
   className="w-10 h-10 rounded-full bg-[#202629] border border-[#2A3033] text-[#9AA6AD] flex items-center justify-center hover:bg-[#2A3033] hover:text-[#F2F4F5] transition"
  >
    <X className="w-5 h-5" />
  </button>
</div>
      <div className="flex items-center gap-2 mt-3 mb-2 px-2">
  <UserRound className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#9AA6AD]">
    Tu cuenta
  </p>
</div>
      {!usuarioActual ? (
  <>
    <button
      onClick={() => {
        setMenuAbierto(false);
        setVolverA("mas");
        setCrearCuentaAbierto(true);
      }}
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#202629] rounded-xl"
    >
      <UserRound className="w-5 h-5 text-[#1B6B63]" />
      Crear cuenta
    </button>

    <button
      onClick={() => {
        setMenuAbierto(false);
        setIniciarSesionAbierto(true);
        setSesionError("");
      }}
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#202629] rounded-xl"
    >
      <LogIn className="w-5 h-5 text-[#1B6B63]" />
      Iniciar sesión
    </button>
  </>
) : (
  <>
    <div className="px-3 py-3 mb-1 bg-[#202629] border border-[#2A3033] rounded-xl">
  <p className="text-xs text-[#9AA6AD]">
    Sesión iniciada
  </p>
  <p className="font-bold text-[#F2F4F5]">
    {usuarioActual.nombre}
  </p>
</div>

    <button
      onClick={buscarMisProductos}
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#202629] rounded-xl"
    >
      <Store className="w-5 h-5 text-[#1B6B63]" />
      Mis productos
    </button>

    <button
      onClick={() => {
        localStorage.removeItem("mercadoCU_usuario");
        setUsuarioActual(null);
        setMenuAbierto(false);
        setMisProductos([]);
        setMisProductosAbierto(false);
        alert("Sesión cerrada");
      }}
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#202629] rounded-xl text-[#C4472B]"
    >
      <LogOut className="w-5 h-5" />
      Cerrar sesión
    </button>
  </>
)}
      <div className="flex items-center gap-2 mt-5 mb-2 px-2">
  <Store className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#9AA6AD]">
    MercadoCU
  </p>
</div>
      <button
  onClick={() => {
  setMenuAbierto(false);
  setTendenciasAbierto(true);
}}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#fff3d9] flex items-center justify-center">
      <Flame className="w-5 h-5 text-[#C4472B]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#F2F4F5]">
        Tendencias
      </p>
      <p className="text-[11px] text-[#9AA6AD]">
        Lo que más se está buscando
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#69757B]" />
</button>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#e6efec] flex items-center justify-center">
      <Store className="w-5 h-5 text-[#1B6B63]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#F2F4F5]">
        Tiendas
      </p>
      <p className="text-[11px] text-[#9AA6AD]">
        Descubre tiendas y vendedores
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#69757B]" />
</button>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#fff3d9] flex items-center justify-center">
      <BadgeCheck className="w-5 h-5 text-[#E8A33D]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#F2F4F5]">
        Verificados
      </p>
      <p className="text-[11px] text-[#9AA6AD]">
        Vendedores y tiendas de confianza
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#69757B]" />
</button>
      <div className="flex items-center gap-2 mt-5 mb-2 px-2">
  <Truck className="w-4 h-4 text-[#1B6B63]" />
 <p className="text-xs uppercase tracking-wider font-bold text-[#9AA6AD]">
    Servicios
  </p>
</div>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#e6efec] flex items-center justify-center">
      <Truck className="w-5 h-5 text-[#1B6B63]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#F2F4F5]">
        Domicilios
      </p>
      <p className="text-[11px] text-[#9AA6AD]">
        Encuentra servicios de entrega
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#69757B]" />
</button>
      <div className="flex items-center gap-2 mt-5 mb-2 px-2">
  <Settings className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#8a8370]">
    Ayuda y configuración
  </p>
</div>

      <button className="w-full flex items-center gap-3 text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition text-[#F2F4F5]">
  <Settings className="w-5 h-5 text-[#7EE2C0]" />
  Configuración
</button>

     <button className="w-full flex items-center gap-3 text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition text-[#F2F4F5]">
  <CircleHelp className="w-5 h-5 text-[#7EE2C0]" />
  Ayuda
</button>

      <button className="w-full flex items-center gap-3 text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition text-[#F2F4F5]">
  <Headphones className="w-5 h-5 text-[#7EE2C0]" />
  Soporte
</button>

      <button className="w-full flex items-center gap-3 text-left px-3 py-3 hover:bg-[#202629] rounded-xl transition text-[#F2F4F5]">
  <Info className="w-5 h-5 text-[#7EE2C0]" />
  Acerca de MercadoCU
</button>

    </div>
  )}
              {crearCuentaAbierto && (
  <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
    <div className="bg-[#151A1D] w-full max-w-lg rounded-t-3xl p-5 shadow-2xl border-t border-[#2A3033]">

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#7EE2C0] font-semibold">
            MercadoCU
          </p>

         <h2 className="text-2xl font-bold text-[#F2F4F5]">
            Crear cuenta
          </h2>
        </div>

        <button
        onClick={() => {
  setCrearCuentaAbierto(false);

  if (volverA === "mas") {
    setMenuAbierto(true);
  } else {
    setMenuAbierto(false);
  }
}}
          className="w-10 h-10 rounded-full bg-[#202629] border border-[#2A3033] text-[#9AA6AD] flex items-center justify-center hover:bg-[#2A3033] hover:text-[#F2F4F5] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {registroPaso === 1 && (
  <>
    <p className="text-sm text-[#9AA6AD] mb-4">
      ¿Cómo quieres utilizar MercadoCU?
    </p>

    <div className="space-y-3">

        <button
  onClick={() =>
  setTipoCuenta(tipoCuenta === "vendedor" ? "" : "vendedor")
}
  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition text-left ${
    tipoCuenta === "vendedor"
      ? "border-2 border-[#7EE2C0] bg-[#7EE2C0]/10"
      : "border border-[#2A3033] bg-[#151A1D] hover:bg-[#202629]"
  }`}
>
          <div className="w-11 h-11 rounded-xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center">
            <UserRound className="w-6 h-6 text-[#7EE2C0]" />
          </div>

          <div>
            <p className="font-bold text-[#F2F4F5]">
              Vendedor
            </p>
            <p className="text-xs text-[#9AA6AD]">
              Publica y vende tus productos
            </p>
          </div>
        </button>

        <button
onClick={() =>
  setTipoCuenta(tipoCuenta === "tienda" ? "" : "tienda")
}
  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition text-left ${
    tipoCuenta === "tienda"
      ? "border-2 border-[#7EE2C0] bg-[#7EE2C0]/10"
      : "border border-[#2A3033] bg-[#151A1D] hover:bg-[#202629]"
  }`}
>
          <div className="w-11 h-11 rounded-xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center">
            <Store className="w-6 h-6 text-[#7EE2C0]" />
          </div>

          <div>
            <p className="font-bold text-[#F2F4F5]">
              Tienda
            </p>
            <p className="text-xs text-[#9AA6AD]">
              Impulsa tu negocio dentro de MercadoCU
            </p>
          </div>
        </button>

        <button
  onClick={() =>
  setTipoCuenta(tipoCuenta === "mensajero" ? "" : "mensajero")
  }
  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition text-left ${
    tipoCuenta === "mensajero"
      ? "border-2 border-[#7EE2C0] bg-[#7EE2C0]/10"
      : "border border-[#2A3033] bg-[#151A1D] hover:bg-[#202629]"
  }`}
>
          <div className="w-11 h-11 rounded-xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center">
            <Truck className="w-6 h-6 text-[#7EE2C0]" />
          </div>

          <div>
            <p className="font-bold text-[#F2F4F5]">
              Mensajero
            </p>
            <p className="text-xs text-[#9AA6AD]">
              Ofrece servicios de domicilio
            </p>
          </div>
        </button>

      </div>
      {tipoCuenta && (
  <button
    onClick={() => setRegistroPaso(2)}
    className="w-full mt-5 bg-[#7EE2C0] text-[#0D1113] font-bold py-3 rounded-xl hover:bg-[#9AEBD2] transition"
  >
    Continuar
  </button>
)}
      </>
)}
      {registroPaso === 2 && (
  <div>

    <button
      onClick={() => {
  setNombreRegistro("");
  setWhatsappRegistro("");
  setPinRegistro("");
  setRegistroPaso(1);
}}
      className="flex items-center gap-2 text-sm text-[#7EE2C0] font-semibold mb-5 hover:text-[#9AEBD2] transition"
    >
      ← Atrás
    </button>

    <h3 className="text-xl font-bold text-[#F2F4F5]">
      {tipoCuenta === "vendedor" && "Crear cuenta de vendedor"}
      {tipoCuenta === "tienda" && "Crear cuenta de tienda"}
      {tipoCuenta === "mensajero" && "Crear cuenta de mensajero"}
    </h3>

    <p className="text-sm text-[#9AA6AD] mt-1 mb-5">
      Solo necesitamos unos datos básicos para comenzar.
    </p>

    <div className="space-y-4">

      <div>
        <label className="block text-sm font-semibold text-[#F2F4F5] mb-1">
          Nombre
        </label>

        <input
  type="text"
  placeholder={
    tipoCuenta === "tienda"
      ? "Nombre de tu tienda"
      : "Tu nombre"
  }
  value={nombreRegistro}
  onChange={(e) => setNombreRegistro(e.target.value)}
  className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 outline-none focus:border-[#7EE2C0] text-[#F2F4F5] placeholder:text-[#69757B]"
/>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#F2F4F5] mb-1">
          WhatsApp
        </label>

        <input
  type="tel"
  placeholder="Tu número de WhatsApp"
  value={whatsappRegistro}
  onChange={(e) => setWhatsappRegistro(e.target.value)}
  className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 outline-none focus:border-[#7EE2C0] text-[#F2F4F5] placeholder:text-[#69757B]"
/>
      </div>

            <div>
        <label className="block text-sm font-semibold text-[#F2F4F5] mb-1">
          Contraseña
        </label>

        <div className="relative">
          <input
            type={mostrarPin ? "text" : "password"}
            placeholder="Crea una contraseña"
            value={pinRegistro}
            onChange={(e) => setPinRegistro(e.target.value)}
           className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#7EE2C0] text-[#F2F4F5] placeholder:text-[#69757B]"
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMostrarPin(!mostrarPin)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#69757B] hover:text-[#7EE2C0] transition"
            aria-label={mostrarPin ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrarPin ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <label className="block text-sm font-semibold text-[#F2F4F5] mt-4 mb-1">
          Confirmar contraseña
        </label>

        <div className="relative">
          <input
            type={mostrarPin ? "text" : "password"}
            placeholder="Repite tu contraseña"
            value={confirmarPinRegistro}
            onChange={(e) => setConfirmarPinRegistro(e.target.value)}
           className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#7EE2C0] text-[#F2F4F5] placeholder:text-[#69757B]"
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMostrarPin(!mostrarPin)}
           className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#69757B] hover:text-[#7EE2C0] transition"
            aria-label={mostrarPin ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrarPin ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

    </div>

    {registroError && (
  <p className="text-sm text-[#C4472B] font-semibold mt-3">
    {registroError}
  </p>
)}
    <button
  onClick={async () => {
    setRegistroError("");

    if (!nombreRegistro.trim()) {
      setRegistroError("Escribe tu nombre.");
      return;
    }

    if (!whatsappRegistro.trim()) {
      setRegistroError("Escribe tu número de WhatsApp.");
      return;
    }

    if (!pinRegistro.trim()) {
      setRegistroError("Crea una contraseña para tu cuenta.");
      return;
    }

    if (pinRegistro.length < 4) {
      setRegistroError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    
    if (pinRegistro !== confirmarPinRegistro) {
  setRegistroError("Las contraseñas no coinciden.");
  return;
    }

    const nuevaCuenta = {
  tipo: tipoCuenta,
  nombre: nombreRegistro.trim(),
  whatsapp: whatsappRegistro.trim(),
  pin: pinRegistro,
};

try {
  const respuesta = await fetch(
    `${API_URL}?accion=registrarUsuario&nombre=${encodeURIComponent(nuevaCuenta.nombre)}&whatsapp=${encodeURIComponent(nuevaCuenta.whatsapp)}&pin=${encodeURIComponent(nuevaCuenta.pin)}&tipo=${encodeURIComponent(nuevaCuenta.tipo)}`
  );

  const resultado = await respuesta.json();

  if (!resultado.exito) {
    setRegistroError(
      resultado.error || "No se pudo crear la cuenta."
    );
    return;
  }

  alert(
    "¡Cuenta creada correctamente! Tu ID de vendedor es " +
    resultado.idVendedor
  );

  setRegistroError("");
  const usuario = {
  idVendedor: resultado.idVendedor,
  nombre: nombreRegistro,
  whatsapp: whatsappRegistro
};

setUsuarioActual(usuario);

localStorage.setItem(
  "mercadoCU_usuario",
  JSON.stringify(usuario)
);

} catch (error) {
  console.error(error);

  setRegistroError(
    "No se pudo conectar con el servidor."
  );
}

  }}
  className="w-full mt-6 bg-[#7EE2C0] text-[#0D1113] font-bold py-3 rounded-xl hover:bg-[#9AEBD2] transition"
>
  Crear mi cuenta
</button>

  </div>
)}

    </div>
  </div>
)}
          <h1
  className="mt-8 text-4xl sm:text-5xl font-black leading-tight max-w-2xl"
  style={{ fontFamily: "'Inter', sans-serif" }}
>
  Lo que se vende en tu provincia,
  <br />
  todo en un solo lugar.
</h1>
          <p className="mt-4 text-white/80 max-w-xl text-base leading-relaxed">
  Compra y vende productos en tu provincia de forma rápida y sencilla. Encuentra lo que necesitas o publica lo que quieres vender.
</p>
<div className="mt-4 flex gap-3 flex-wrap">
  <div className="bg-white/10 px-4 py-2 rounded-xl">
    💵 USD: {tasas.USD} CUP
  </div>

  <div className="bg-white/10 px-4 py-2 rounded-xl">
    💶 EUR: {tasas.EUR} CUP
  </div>
</div>

        </div>
          </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 mt-6">
        <div className="bg-[#151A1D] border border-[#2A3033] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
         <div className="flex items-center gap-2 flex-1 bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-[#8a8370]" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar un producto..."
              className="w-full outline-none text-sm bg-transparent text-[#F2F4F5] placeholder:text-[#69757B]"
            />
          </div>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="border border-[#2A3033] rounded-xl px-4 py-3 text-sm bg-[#151A1D] text-[#F2F4F5] outline-none"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
  className="bg-[#1B6B63] hover:bg-[#237D73] text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
>
  <SlidersHorizontal className="w-4 h-4" />
  Filtros
</button>

<button
  onClick={() => {
    setBusqueda("");
    setCategoria("Todas");
    setProvincia("Todas");
  }}
  className="bg-[#202629] hover:bg-[#2A3033] border border-[#3A474B] text-[#F2F4F5] px-6 py-3 rounded-xl font-semibold transition"
>
  Limpiar
</button>

{filtrosAbiertos && (
  <div className="w-full bg-[#151A1D] border border-[#2A3033] rounded-2xl p-4 shadow-xl mt-3 max-h-[60vh] overflow-y-auto">
    <h3 className="text-sm font-semibold text-[#F2F4F5] mb-3">
      Filtros
    </h3>
<label className="text-sm font-medium text-[#9AA6AD]">
  Ordenar por
</label>

<select
  value={orden}
  onChange={e => setOrden(e.target.value)}
 className="w-full border border-[#2A3033] rounded-xl px-4 py-3 text-sm bg-[#0D1113] text-[#F2F4F5] mt-2 outline-none focus:border-[#7EE2C0]"
>
  <option value="recientes">Más recientes</option>
  <option value="precioMenor">Precio menor a mayor</option>
  <option value="precioMayor">Precio mayor a menor</option>
</select>
     <label className="text-sm font-medium text-[#9AA6AD] mt-4 block">
      Moneda
    </label>

    <select
      value={moneda}
      onChange={e => setMoneda(e.target.value)}
     className="w-full border border-[#2A3033] rounded-xl px-4 py-3 text-sm bg-[#0D1113] text-[#F2F4F5] mt-2 outline-none focus:border-[#7EE2C0]"
    >
      <option value="Todas">Todas</option>
      <option value="CUP">CUP</option>
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
    </select>

  </div>
)}

</div>
</div>

<div className="max-w-6xl mx-auto px-5 mt-6">

  <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide text-[#9AA6AD] font-semibold">
    <MapPin className="w-3.5 h-3.5" />
    Provincia
  </div>

  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">

    {PROVINCIAS.map(p => (
      <button
        key={p}
        onClick={() => setProvincia(p)}
        className={`whitespace-nowrap px-4 py-2.5 rounded-full text-[13px] font-semibold border transition-all duration-200 active:scale-95 ${
          provincia === p
  ? "bg-[#1B6B63] text-[#F2F4F5] border-[#2A8178] shadow-[0_4px_14px_rgba(27,107,99,0.20)]"
  : "bg-[#151A1D] text-[#9AA6AD] border-[#30383C] hover:border-[#4A555A] hover:text-[#F2F4F5]"
        }`}
      >
        {p}
      </button>
    ))}

  </div>

</div>

<main className="max-w-6xl mx-auto px-5 mt-6 pb-16">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#9AA6AD] uppercase tracking-wide">
            {productosFiltrados.length} anuncio{productosFiltrados.length !== 1 ? "s" : ""} encontrado{productosFiltrados.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="bg-[#151A1D] border border-[#2A3033] rounded-2xl p-10 text-center text-[#9AA6AD] text-sm">
  No hay publicaciones con esos filtros todavía.
  <br />
  Prueba con otra provincia o categoría.
</div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-5">
            {productosFiltrados.map(p => (
  <article
    key={p.id}
    id={`producto-${p.id}`}
    className={`bg-[#151A1D] rounded-3xl border overflow-hidden transition-all duration-500 ${
      productoDestacado === p.id
        ? "border-[#E8A33D] shadow-[0_0_0_4px_rgba(232,163,61,0.18),0_12px_35px_rgba(0,0,0,0.35)] scale-[1.01]"
        : "border-[#2A3033] shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
    }`}
  >

    {/* CABECERA DE LA PUBLICACIÓN */}
<div className="flex items-center justify-between px-4 pt-4 pb-3">

  <div className="flex items-center gap-3">

    {/* AVATAR */}
    <div className="relative">

      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B6B63] to-[#164F4A] border border-[#3A827A] flex items-center justify-center text-white font-bold text-sm shadow-[0_5px_16px_rgba(0,0,0,0.28)]">
  {p.vendedor
    ? p.vendedor
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0])
        .join("")
        .toUpperCase()
    : "U"}
</div>

      {/* INDICADOR */}
      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#79D6A3] border-2 border-[#151A1D]" />

    </div>

    {/* INFORMACIÓN DEL VENDEDOR */}
    <div className="min-w-0">

      <p className="text-sm font-bold text-[#F2F4F5] truncate">
        {p.vendedor || "Vendedor"}
      </p>

      <p className="text-[11px] text-[#9AA6AD] flex items-center gap-1 mt-0.5">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {p.provincia}
        </span>
      </p>

    </div>

  </div>

  {/* MENÚ */}
<button
  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[#9AA6AD] bg-[#202629] border border-[#30383C] hover:bg-[#272E31] hover:text-[#F2F4F5] hover:border-[#3A464B] active:scale-95 transition-all"
>
  <MoreHorizontal className="w-5 h-5" />
</button>

</div>

    {/* TÍTULO */}
<div className="px-4 pb-4">

  <div className="flex items-center gap-2 mb-2.5">

    {/* CATEGORÍA */}
    <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#7EE2C0]">
      {p.categoria}
    </span>

    <span className="w-1 h-1 rounded-full bg-[#4A555A]" />

    {/* ESTADO */}
    {p.estado === "Vendido" ? (
      <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#FF8A76]">
        Vendido
      </span>
    ) : p.estado === "Reservado" ? (
      <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#E8C56A]">
        Reservado
      </span>
    ) : (
      <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#79D6A3]">
        En venta
      </span>
    )}

  </div>

  <h3 className="text-[22px] font-extrabold tracking-tight text-[#F2F4F5] leading-[1.15]">
    {p.nombre}
  </h3>

</div>

    {/* CARRUSEL DE FOTOS */}
{p.fotos && p.fotos.length > 0 && (
  <CarruselFotos
    fotos={p.fotos}
    nombre={p.nombre}
  />
)}

    {/* INFORMACIÓN */}
<div className="px-4 pt-4 pb-1">

  <div className="flex items-center justify-between gap-3">

    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9AA6AD] mb-1">
        Precio
      </p>

      <div className="text-3xl font-black tracking-tight text-[#5FBFA5]">
        <EtiquetaPrecio
          precio={p.precio}
          moneda={p.moneda}
        />
      </div>
    </div>

    {p.estado === "Vendido" ? (
      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-[#FF8A76] bg-[#C4472B]/15 border border-[#C4472B]/20 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B57]" />
        Vendido
      </span>
    ) : p.estado === "Reservado" ? (
      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-[#E8C56A] bg-[#E8A33D]/10 border border-[#E8A33D]/20 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" />
        Reservado
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-[#79D6A3] bg-[#79D6A3]/10 border border-[#79D6A3]/20 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#79D6A3]" />
        En venta
      </span>
    )}

  </div>

</div>

   {/* INTERACCIONES */}
<div className="px-4 pt-3 pb-1">

  <div className="flex items-center justify-between">

    {/* ME GUSTA */}
<button
  onClick={() => {
  if (
    p.estado === "Vendido" ||
    p.estado === "Reservado"
  ) {
    return;
  }



  alternarMeGusta(p);

  
}}
  disabled={
    p.estado === "Vendido" ||
    p.estado === "Reservado"
  }
  className={`group flex items-center gap-2 transition-all ${
    p.estado === "Vendido" ||
    p.estado === "Reservado"
      ? "opacity-40 cursor-not-allowed"
      : "active:scale-95"
  }`}
>
  <div
    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
      productosMeGusta.some(
        (producto) => producto._fila === p._fila
      )
        ? "bg-[#C4472B]"
        : "bg-[#202629] group-hover:bg-[#2A3033]"
    }`}
  >
    <Heart
      className={`w-4 h-4 transition ${
        productosMeGusta.some(
          (producto) => producto._fila === p._fila
        )
          ? "text-white fill-white"
          : "text-[#9AA6AD]"
      }`}
      strokeWidth={1.8}
    />
  </div>

  <div className="text-left leading-tight">
    <p className="text-sm font-bold text-[#F2F4F5]">
      {Number(p.meGusta || 0)}
    </p>

    <p className="text-[10px] text-[#9AA6AD]">
      me gusta
    </p>
  </div>
</button>


 {/* GUARDAR */}
<button
  onClick={() => {
    const estadoProducto = String(p.estado || "")
      .trim()
      .toUpperCase();

    if (
      estadoProducto === "VENDIDO" ||
      estadoProducto === "RESERVADO"
    ) {
      return;
    }

    alternarProductoGuardado(p);
  }}
  disabled={
    String(p.estado || "").trim().toUpperCase() === "VENDIDO" ||
    String(p.estado || "").trim().toUpperCase() === "RESERVADO"
  }
  className={`group flex items-center gap-2 transition-all ${
    ["VENDIDO", "RESERVADO"].includes(
      String(p.estado || "").trim().toUpperCase()
    )
      ? "opacity-40 cursor-not-allowed"
      : "active:scale-95"
  }`}
>
  <div
    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
      productosGuardados.some(
        (producto) => producto._fila === p._fila
      )
        ? "bg-[#2563EB]"
        : "bg-[#202629] group-hover:bg-[#2A3033]"
    }`}
  >
    <ShoppingCart
      className={`w-4 h-4 transition ${
        productosGuardados.some(
          (producto) => producto._fila === p._fila
        )
          ? "text-white"
          : "text-[#9AA6AD]"
      }`}
      strokeWidth={1.8}
    />
  </div>

  <div className="text-left leading-tight">
    <p className="text-sm font-bold text-[#F2F4F5]">
      {Number(p.guardados || 0)}
    </p>

    <p className="text-[10px] text-[#9AA6AD]">
      guardados
    </p>
  </div>
</button>


    {/* VISUALIZACIONES */}
<div className="flex items-center gap-2">

  <div
    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
      Number(p.visualizaciones || 0) === 0
        ? "bg-[#202629]"
        : Number(p.visualizaciones || 0) < 5
        ? "bg-[#24566B]"
        : Number(p.visualizaciones || 0) < 10
        ? "bg-[#5A3D78]"
        : Number(p.visualizaciones || 0) < 25
        ? "bg-[#8A5A24]"
        : Number(p.visualizaciones || 0) < 50
        ? "bg-[#7A315E]"
        : "bg-[#8A6A24]"
    }`}
  >
    <Eye
      className={`w-4 h-4 ${
        Number(p.visualizaciones || 0) === 0
          ? "text-[#9AA6AD]"
          : Number(p.visualizaciones || 0) < 5
          ? "text-[#7DD3FC]"
          : Number(p.visualizaciones || 0) < 10
          ? "text-[#C4A7E7]"
          : Number(p.visualizaciones || 0) < 25
          ? "text-[#F2B86B]"
          : Number(p.visualizaciones || 0) < 50
          ? "text-[#E78BC4]"
          : "text-[#F2D27A]"
      }`}
      strokeWidth={1.8}
    />
  </div>

  <div className="leading-tight">
    <p className="text-sm font-bold text-[#F2F4F5]">
      {Number(p.visualizaciones || 0)}
    </p>

    <p className="text-[10px] text-[#9AA6AD]">
      visualizaciones
    </p>
  </div>

</div>
    </div>
  </div>

{/* ACCIONES */}
<div className="px-4 pt-3 pb-4">

  <div className="h-px bg-[#2A3033] mb-3" />

  <div className="grid grid-cols-3 gap-2.5">

    {/* PREGUNTAR */}
<button
  onClick={() => {
  if (p.estado === "Vendido") return;

  const numero = `53${String(p.tel).replace(/\s+/g, "")}`;

  const mensaje = `Hola, estoy interesado en el producto "${p.nombre}". ¿Sigue disponible?`;

  window.open(
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}}
  disabled={p.estado === "Vendido"}
  className={`group flex items-center justify-center gap-1.5 transition-all text-[12px] sm:text-[13px] font-bold py-3.5 rounded-2xl ${
    p.estado === "Vendido"
      ? "bg-[#202629] text-[#5C666B] border border-[#2A3033] cursor-not-allowed opacity-60"
      : "bg-[#1B6B63] hover:bg-[#23786F] active:scale-[0.97] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
  }`}
>
  <MessageCircle
    className={`w-4 h-4 shrink-0 ${
      p.estado === "Vendido"
        ? "text-[#5C666B]"
        : "group-hover:scale-105 transition-transform"
    }`}
  />
  <span>
    {p.estado === "Vendido" ? "Vendido" : "Preguntar"}
  </span>
</button>

    {/* VER PRODUCTO */}
    <button
      onClick={() => {
  registrarInteraccion({
    tipo: "VER_PRODUCTO",
    producto: p,
    identificador: "VER_PRODUCTO",
    esUnica: "SI"
  });

  setSeleccionado(p);
}}
      className="group flex items-center justify-center gap-1.5 bg-[#202629] hover:bg-[#272E31] active:scale-[0.97] transition-all text-[#F2F4F5] text-[12px] sm:text-[13px] font-semibold py-3.5 rounded-2xl border border-[#30383C] hover:border-[#3A464B]"
    >
      <ChevronRight
        className="w-4 h-4 shrink-0 text-[#7EE2C0] group-hover:translate-x-0.5 transition-transform"
      />
      <span>Ver producto</span>
    </button>

    {/* COMPARTIR */}
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({
            title: p.nombre,
            text: `Mira este producto en MercadoCU: ${p.nombre}`,
            url: window.location.href
          }).catch(() => {});
        }
      }}
      className="group flex items-center justify-center gap-1.5 bg-[#202629] hover:bg-[#272E31] active:scale-[0.97] transition-all text-[#F2F4F5] text-[12px] sm:text-[13px] font-semibold py-3.5 rounded-2xl border border-[#30383C] hover:border-[#3A464B]"
    >
      <Share2
        className="w-4 h-4 shrink-0 text-[#9AA6AD] group-hover:text-[#7EE2C0] transition-colors"
      />
      <span>Compartir</span>
    </button>

  </div>

</div>

  </article>
))}
  
          </div>
        )}
      </main>

      <section className="bg-[#232620] text-[#F5F1E6] pt-10 pb-28">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <Tag className="w-5 h-5 text-[#E8A33D]" /> ¿VENDES ALGO? PUBLÍCALO AQUÍ
            </h3>
            <p className="text-sm text-[#c9c4b3] mt-1 max-w-md">
              Pagas una cuota mensual fija por tener tu vidriera activa en tu provincia. Sin comisión por venta.
            </p>
          </div>
          <button
  onClick={() => {
  if (!usuarioActual) {
    setAccesoPublicarAbierto(true);
    return;
  }

  setPublicarAbierto(true);
}}
  className="bg-[#E8A33D] text-[#232620] font-bold px-6 py-3 rounded-xl hover:bg-[#d99429] transition whitespace-nowrap"
>
  Quiero publicar
</button>
        </div>
      </section>
    {accesoPublicarAbierto && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
    <div className="bg-[#151A1D] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#2A3033]">

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#7EE2C0] font-semibold">
            MercadoCU
          </p>
          <h2 className="text-2xl font-bold text-[#F2F4F5]">
            Quiero publicar
          </h2>
        </div>

        <button
          onClick={() => setAccesoPublicarAbierto(false)}
          className="w-10 h-10 rounded-full bg-[#202629] border border-[#2A3033] text-[#9AA6AD] flex items-center justify-center hover:bg-[#2A3033] hover:text-[#F2F4F5] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-[#9AA6AD] mb-5">
        Para publicar un producto necesitas una cuenta. ¿Qué quieres hacer?
      </p>

      <div className="space-y-3">

        <button
          onClick={() => {
            setAccesoPublicarAbierto(false);
            setVolverA("publicar");
            setCrearCuentaAbierto(true);
          }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#2A3033] bg-[#202629] hover:bg-[#272E31] transition text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center">
            <UserRound className="w-6 h-6 text-[#7EE2C0]" />
          </div>

          <div>
            <p className="font-bold text-[#F2F4F5]">
              Crear cuenta
            </p>
            <p className="text-xs text-[#9AA6AD]">
              Regístrate y comienza a publicar
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-[#69757B] ml-auto" />
        </button>

        <button
          onClick={() => {
            setAccesoPublicarAbierto(false);
            setIniciarSesionAbierto(true);
            setSesionError("");
          }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#2A3033] bg-[#202629] hover:bg-[#272E31] transition text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-[#7EE2C0]" />
          </div>

          <div>
            <p className="font-bold text-[#F2F4F5]">
              Iniciar sesión
            </p>
            <p className="text-xs text-[#9AA6AD]">
              Ya tengo una cuenta
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-[#69757B] ml-auto" />
        </button>

      </div>

    </div>
  </div>
)}

      {seleccionado && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto overscroll-contain">

    <div className="bg-[#151A1D] border border-[#2A3033] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 pt-16 relative shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-[#F2F4F5]">

      {/* CERRAR */}
      <button
        onClick={() => setSeleccionado(null)}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#202629] border border-[#30383C] text-[#9AA6AD] flex items-center justify-center hover:text-white hover:bg-[#272E31] active:scale-95 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

     {/* CARRUSEL DE FOTOS */}
{seleccionado.fotos && seleccionado.fotos.length > 0 && (
  <div className="mb-4 rounded-2xl overflow-hidden border border-[#2A3033]">
    <CarruselFotos
      fotos={seleccionado.fotos}
      nombre={seleccionado.nombre}
    />
  </div>
)}

{/* ESTADO */}
<div className="flex items-center gap-2 mb-3">

  {seleccionado.estado === "Vendido" ? (
    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-[#FF8A76] bg-[#C4472B]/15 border border-[#C4472B]/20 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B57]" />
      Vendido
    </span>
  ) : seleccionado.estado === "Reservado" ? (
    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-[#E8C56A] bg-[#E8A33D]/10 border border-[#E8A33D]/20 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" />
      Reservado
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-[#79D6A3] bg-[#79D6A3]/10 border border-[#79D6A3]/20 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#79D6A3]" />
      En venta
    </span>
  )}

</div>
      {/* CATEGORÍA */}
      <span className="inline-flex text-[10px] uppercase font-bold tracking-[0.1em] text-[#6BC7AD] bg-[#1B6B63]/20 border border-[#1B6B63]/30 px-2.5 py-1.5 rounded-full">
        {seleccionado.categoria}
      </span>

      {/* NOMBRE */}
      <h3 className="font-extrabold text-2xl mt-3 pr-10 tracking-tight text-[#F2F4F5] leading-tight">
        {seleccionado.nombre}
      </h3>

      {/* VENDEDOR */}
      <div className="flex items-center gap-2 mt-3 text-sm text-[#9AA6AD]">

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B6B63] to-[#164F4A] border border-[#3A827A] flex items-center justify-center text-white text-[10px] font-bold">
          {seleccionado.vendedor
            ? seleccionado.vendedor
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(parte => parte[0])
                .join("")
                .toUpperCase()
            : "U"}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#F2F4F5] truncate">
            {seleccionado.vendedor || "Vendedor"}
          </p>

          <p className="text-[11px] text-[#9AA6AD] flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {seleccionado.provincia}
          </p>
        </div>

      </div>

      {/* PRECIO */}
      <div className="mt-5 bg-[#202629] border border-[#2A3033] rounded-2xl px-4 py-3">

        <p className="text-[10px] uppercase tracking-[0.12em] text-[#9AA6AD] mb-1">
          Precio
        </p>

        <div className="text-3xl font-black tracking-tight text-[#7EE2C0]">
          <EtiquetaPrecio
            precio={seleccionado.precio}
            moneda={seleccionado.moneda}
          />
        </div>

      </div>

      {/* INFORMACIÓN */}
      <p className="text-sm text-[#9AA6AD] mt-4 leading-relaxed">
        El pago y la entrega se coordinan directamente con el vendedor.
      </p>

     {/* WHATSAPP */}
<button
  onClick={() => {
  if (seleccionado.estado === "Vendido") return;

  registrarInteraccion({
    tipo: "WHATSAPP",
    producto: seleccionado,
    identificador: "WHATSAPP",
    esUnica: "SI"
  });

  const numero = `53${String(seleccionado.tel).replace(/\s+/g, "")}`;

  const mensaje = `Hola, estoy interesado en el producto "${seleccionado.nombre}". ¿Sigue disponible?`;

  console.log(seleccionado);

  window.open(
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}}
  disabled={seleccionado.estado === "Vendido"}
  className={`mt-5 w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-all ${
    seleccionado.estado === "Vendido"
      ? "bg-[#202629] text-[#5C666B] border border-[#2A3033] cursor-not-allowed opacity-60"
      : "bg-[#1B6B63] hover:bg-[#23786F] active:scale-[0.98] text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
  }`}
>
  <MessageCircle className="w-5 h-5" />
  {seleccionado.estado === "Vendido"
    ? "Producto vendido"
    : "Contactar por WhatsApp"}
</button>

    </div>
  </div>
)}

     
          {iniciarSesionAbierto && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">

    <div className="relative bg-[#151C1E] border border-[#2A3437] rounded-3xl max-w-sm w-full p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden">

      {/* ACENTO SUPERIOR */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7EE2C0] via-[#5FBFA5] to-transparent" />

      {/* CERRAR */}
      <button
        onClick={() => setIniciarSesionAbierto(false)}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#202A2D] border border-[#303B3E] flex items-center justify-center text-[#9AA6AD] hover:text-white active:scale-95 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ICONO */}
      <div className="w-12 h-12 rounded-2xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center mb-5">
        <LogIn
          className="w-6 h-6 text-[#7EE2C0]"
          strokeWidth={2.2}
        />
      </div>

      {/* TITULO */}
      <h2 className="text-2xl font-black tracking-tight text-[#F2F4F5] mb-2">
        Bienvenido de nuevo
      </h2>

      <p className="text-sm leading-6 text-[#9AA6AD] mb-6">
        Inicia sesión para continuar en MercadoCU.
      </p>

      {/* WHATSAPP */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wide text-[#9AA6AD] mb-2">
          WhatsApp
        </label>

        <input
          type="tel"
          value={whatsappSesion}
onChange={(e) => setWhatsappSesion(e.target.value)}
          placeholder="Tu número de WhatsApp"
          className="w-full bg-[#202A2D] border border-[#354145] rounded-2xl px-4 py-3.5 text-[#F2F4F5] placeholder:text-[#68757A] outline-none focus:border-[#7EE2C0] focus:ring-2 focus:ring-[#7EE2C0]/10 transition-all"
        />
      </div>

      {/* CONTRASEÑA */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wide text-[#9AA6AD] mb-2">
          Contraseña
        </label>

        <div className="relative">

          <input
            type={mostrarPinSesion ? "text" : "password"}
            value={pinSesion}
onChange={(e) => setPinSesion(e.target.value)}
            placeholder="Tu contraseña"
            className="w-full bg-[#202A2D] border border-[#354145] rounded-2xl px-4 py-3.5 pr-12 text-[#F2F4F5] placeholder:text-[#68757A] outline-none focus:border-[#7EE2C0] focus:ring-2 focus:ring-[#7EE2C0]/10 transition-all"
          />

          <button
            type="button"
            onClick={() => setMostrarPinSesion(!mostrarPinSesion)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-[#9AA6AD] hover:text-[#7EE2C0] transition-colors"
          >
            {mostrarPinSesion ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>

        </div>
      </div>

      {/* ERROR */}
      {sesionError && (
        <div className="mb-4 bg-[#C4472B]/10 border border-[#C4472B]/20 rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold text-[#FF8A76]">
            {sesionError}
          </p>
        </div>
      )}

      {/* BOTON */}
      <button
        onClick={iniciarSesion}
        className="w-full bg-[#7EE2C0] text-[#0D1113] font-bold py-3.5 rounded-2xl shadow-[0_8px_25px_rgba(126,226,192,0.12)] active:scale-[0.98] transition-all"
      >
        Iniciar sesión
      </button>

      {/* REGISTRO */}
      <button
        onClick={() => {
          setIniciarSesionAbierto(false);
          setVolverA("publicar");
          setCrearCuentaAbierto(true);
        }}
        className="w-full mt-3 py-3 text-sm font-semibold text-[#9AA6AD] hover:text-[#7EE2C0] transition-colors"
      >
        ¿No tienes cuenta?{" "}
        <span className="text-[#7EE2C0]">
          Crear cuenta
        </span>
      </button>

    </div>
  </div>
)}
        {misProductosAbierto && (
  <div className="fixed inset-0 bg-black/70 overflow-y-auto p-4 z-50">
    <div className="bg-[#151A1D] border border-[#2A3033] rounded-3xl max-w-lg w-full p-5 relative shadow-2xl mx-auto mt-10 mb-10 text-[#F2F4F5]">

      <button
        onClick={() => setMisProductosAbierto(false)}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#202629] text-[#9AA6AD] flex items-center justify-center hover:text-white transition"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-bold mb-1">
  Mis productos
</h2>

<p className="text-sm text-[#9AA6AD] mb-5">
  Administra tus publicaciones
</p>

      {cargandoMisProductos ? (
  <p className="text-center text-[#9AA6AD] py-6">
    Cargando tus productos...
  </p>
) : misProductos.length === 0 ? (
  <p className="text-center text-[#9AA6AD] py-6">
    No tienes productos publicados todavía.
  </p>
) : null}
      {misProductos.length > 0 && (
  <div className="mt-4">
    <h3 className="font-bold mb-2">
      Tus productos:
    </h3>

    {misProductos.map((p, index) => (
  <div
  key={index}
  className="bg-[#0D1113] border border-[#2A3033] rounded-2xl p-4 mb-3 shadow-sm"
>
    {p["Foto del Producto"] && (
  <div className="relative w-full bg-[#0B0F11] overflow-hidden">

    <div className="aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center overflow-x-auto">
      <div className="flex gap-2 h-full">

        {String(p["Foto del Producto"])
          .split("||")
          .map((url, fotoIndex) => {
            const foto = url.trim();

            if (!foto) return null;

            let fotoDirecta = foto;

            if (foto.includes("drive.google.com/file/d/")) {
              const partes = foto.split("/d/");

              if (partes[1]) {
                const id = partes[1].split("/")[0];

                fotoDirecta =
                  "https://drive.google.com/uc?export=view&id=" + id;
              }
            }

            return (
              <div
                key={fotoIndex}
                className="h-full min-w-full flex items-center justify-center bg-[#0B0F11] overflow-hidden"
              >
                <img
                  src={fotoDirecta.replace(
                    "uc?export=view&id=",
                    "thumbnail?sz=w1000&id="
                  )}
                  onError={(e) => {
                    e.currentTarget.src = fotoDirecta;
                  }}
                  alt={`${p["Nombre del producto"]} - foto ${fotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            );
          })}

      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2A3033]" />

  </div>
)}
    {p["Estado"] === "Vendido" && (
  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-2">
    VENDIDO
  </div>
)}
    <p className="font-semibold text-[#F2F4F5] text-lg">
  {p["Nombre del producto"]}
</p>

    <p className="text-[#F2F4F5] font-bold text-xl mt-1">
  {p["Precio"]} {p["Moneda"]}
</p>

    <div className="grid grid-cols-2 gap-2 mt-4">

  <button
    onClick={() => abrirEdicion(p)}
    className="flex items-center justify-center gap-2 bg-[#1B6B63] hover:bg-[#237D73] text-white py-2.5 rounded-xl text-sm font-semibold transition"
  >
    Editar
  </button>

  <button
  onClick={() => {
    if (p["Estado"] === "Vendido") return;
    marcarReservado(p._fila);
  }}
  disabled={p["Estado"] === "Vendido"}
  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
    p["Estado"] === "Vendido"
      ? "bg-[#151A1D] border border-[#2A3033] text-[#5C666B] cursor-not-allowed opacity-60"
      : "bg-[#202629] hover:bg-[#2A3033] border border-[#3A474B] text-[#F2F4F5]"
  }`}
>
  {p["Estado"] === "Vendido" ? "Vendido" : "Reservar"}
</button>

  <button
  onClick={() => {
    if (p["Estado"] === "Vendido") return;
    marcarVendido(p._fila);
  }}
  disabled={p["Estado"] === "Vendido"}
  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
    p["Estado"] === "Vendido"
      ? "bg-[#321F1F] border border-[#613030] text-[#FF6B57] cursor-not-allowed opacity-70"
      : "bg-[#202629] hover:bg-[#2A3033] border border-[#3A474B] text-[#F2F4F5]"
  }`}
>
  {p["Estado"] === "Vendido" ? "Vendido" : "Vendido"}
</button>

 {(p["Estado"] === "Vendido" || p["Estado"] === "Reservado") && (
  <button
    onClick={() => marcarEnVenta(p._fila)}
    className="flex items-center justify-center gap-2 bg-[#1B6B63] hover:bg-[#237D73] text-white py-2.5 rounded-xl text-sm font-semibold transition"
  >
    Poner en venta
  </button>
)}
      <button
    onClick={() => eliminarProducto(p._fila)}
    className="col-span-2 flex items-center justify-center gap-2 bg-[#321F1F] hover:bg-[#452323] border border-[#613030] text-[#FF6B57] py-2.5 rounded-xl text-sm font-semibold transition"
  >
    Eliminar
  </button>

</div>
  </div>
))}
  </div>
)}
      <button
  onClick={() => {
    setMisProductosAbierto(false);
    setMisProductos([]);
    setWhatsappLogin("");
  }}
  className="w-full mt-5 bg-[#202629] border border-[#3A474B] text-[#F2F4F5] font-semibold py-3 rounded-xl hover:bg-[#2A3033] transition"
>
  Cerrar
</button>

    </div>
  </div>
)}
      {editandoProducto && productoEditando && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    <div className="bg-[#151A1D] border border-[#2A3033] rounded-3xl max-w-md w-full p-5 relative shadow-2xl">

      <button
        onClick={() => {
          setEditandoProducto(false);
          setProductoEditando(null);
        }}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#202629] border border-[#2A3033] text-[#9AA6AD] flex items-center justify-center hover:bg-[#2A3033] hover:text-[#F2F4F5] transition"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold mb-5 text-[#F2F4F5]">
        Editar producto
      </h2>

      <input
        type="text"
        value={nombreProducto}
        onChange={(e) => setNombreProducto(e.target.value)}
        placeholder="Nombre del producto"
        className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 mb-3 outline-none focus:border-[#7EE2C0] text-[#F2F4F5] placeholder:text-[#69757B]"
      />

      <select
        value={categoriaProducto}
        onChange={(e) => setCategoriaProducto(e.target.value)}
        className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 mb-3 outline-none focus:border-[#7EE2C0] text-[#F2F4F5]"
      >
        {CATEGORIAS.filter(c => c !== "Todas").map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={provinciaProducto}
        onChange={(e) => setProvinciaProducto(e.target.value)}
        className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 mb-3 outline-none focus:border-[#7EE2C0] text-[#F2F4F5]"
      >
        {PROVINCIAS.filter(p => p !== "Todas").map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={monedaProducto}
        onChange={(e) => setMonedaProducto(e.target.value)}
        className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 mb-3 outline-none focus:border-[#7EE2C0] text-[#F2F4F5]"
      >
        <option value="CUP">CUP</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>

      <input
        type="number"
        value={precioProducto}
        onChange={(e) => setPrecioProducto(e.target.value)}
        placeholder="Precio"
        className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 mb-4 outline-none focus:border-[#7EE2C0] text-[#F2F4F5] placeholder:text-[#69757B]"
      />
      <div className="mb-4">
  <label className="block text-sm font-semibold text-[#F2F4F5] mb-2">
  Cambiar foto
</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImagenProducto(e.target.files[0] || null)}
    className="w-full bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 text-sm text-[#9AA6AD] file:mr-3 file:rounded-lg file:border-0 file:bg-[#7EE2C0] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#0D1113] hover:file:bg-[#9AEBD2] transition"
  />
</div>

      <button
  onClick={async () => {
    if (!nombreProducto || !precioProducto) {
      alert("Completa el nombre y el precio");
      return;
    }

    try {
      // Subir nueva foto si se seleccionó una
      if (imagenProducto) {
        const reader = new FileReader();

        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imagenProducto);
        });

        const respuestaFoto = await fetch(API_URL, {
          method: "POST",
          body: new URLSearchParams({
            accion: "editarFoto",
            fila: productoEditando._fila,
            imagen: base64,
            tipo: imagenProducto.type,
            nombre: imagenProducto.name
          })
        });

        const resultadoFoto = await respuestaFoto.json();

        if (!resultadoFoto.exito) {
          alert("No se pudo subir la nueva foto");
          return;
        }
      }

      // Actualizar los datos del producto
      const respuesta = await fetch(
        `${API_URL}?accion=editarProducto&fila=${productoEditando._fila}&nombre=${encodeURIComponent(nombreProducto)}&categoria=${encodeURIComponent(categoriaProducto)}&provincia=${encodeURIComponent(provinciaProducto)}&moneda=${encodeURIComponent(monedaProducto)}&precio=${encodeURIComponent(precioProducto)}`
      );

      const resultado = await respuesta.json();

      if (resultado.exito) {

        setMisProductos(prev =>
          prev.map(p =>
            p._fila === productoEditando._fila
              ? {
                  ...p,
                  "Nombre del producto": nombreProducto,
                  "Categoría": categoriaProducto,
                  "Provincia": provinciaProducto,
                  "Moneda": monedaProducto,
                  "Precio": precioProducto
                }
              : p
          )
        );

        setProductos(prev =>
          prev.map(p =>
            p._fila === productoEditando._fila
              ? {
                  ...p,
                  nombre: nombreProducto,
                  categoria: categoriaProducto,
                  provincia: provinciaProducto,
                  moneda: monedaProducto,
                  precio: precioProducto
                }
              : p
          )
        );

        setImagenProducto(null);
        setEditandoProducto(false);
        setProductoEditando(null);

        alert("Producto actualizado correctamente");

      } else {
        alert("No se pudo actualizar el producto");
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar el producto");
    }
  }}
  className="w-full bg-[#7EE2C0] text-[#0D1113] font-bold py-3 rounded-xl hover:bg-[#9AEBD2] transition"
>
  Guardar cambios
</button>

    </div>
  </div>
)}
      {buscarAbierto && (
  <div className="fixed inset-0 bg-black/70 flex items-start justify-center p-4 z-50">
    <div className="bg-[#151A1D] border border-[#2A3033] rounded-3xl max-w-md w-full mt-6 shadow-2xl overflow-hidden">

      <div className="flex items-center justify-between p-4 border-b border-[#2A3033]">
      <h2 className="text-lg font-bold text-[#F2F4F5]">
          Buscar productos
        </h2>

        <button
          onClick={() => setBuscarAbierto(false)}
          className="w-9 h-9 rounded-full bg-[#202629] border border-[#2A3033] text-[#9AA6AD] flex items-center justify-center hover:bg-[#2A3033] hover:text-[#F2F4F5] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-3">

       <div className="flex items-center gap-2 bg-[#0D1113] border border-[#2A3033] rounded-xl px-4 py-3 focus-within:border-[#7EE2C0] transition">
          <Search className="w-4 h-4 text-[#7EE2C0]" />

          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="w-full outline-none text-sm bg-transparent text-[#F2F4F5] placeholder:text-[#69757B]"
            autoFocus
          />
        </div>
        <p className="text-xs text-[#9AA6AD] px-1 pt-1">
  Busca productos por nombre o palabra clave
</p>
        {busqueda && (
  <div className="pt-2">
    <p className="text-xs font-semibold text-[#9AA6AD] mb-2">
      Resultados de búsqueda
    </p>

    <div className="space-y-2 max-h-72 overflow-y-auto">
      {productosFiltrados.length > 0 ? (
        productosFiltrados.map(p => (
          <div
  key={p.id}
 onClick={() => {
  registrarInteraccion({
    tipo: "BUSQUEDA",
    producto: p,
    identificador: "RESULTADO",
    termino: busqueda,
    resultadoBusqueda: "ENCONTRADO",
    esUnica: "SI"
  });

  setProductoDestino(p);
  setBusqueda("");
  setBuscarAbierto(false);
}}
   className="flex items-center gap-3 p-3 rounded-xl border border-[#2A3033] bg-[#151A1D] hover:bg-[#202629] hover:border-[#3A474B] transition-colors cursor-pointer"
>
            {p.foto && (
              <img
                src={p.foto.replace(
                  "uc?export=view&id=",
                  "thumbnail?sz=w200&id="
                )}
                alt={p.nombre}
                className="w-12 h-12 rounded-lg object-contain bg-[#0D1113] border border-[#2A3033]"
              />
            )}

            <div className="min-w-0">
              <p className="font-semibold text-sm text-[#F2F4F5] truncate">
                {p.nombre}
              </p>

              <p className="text-xs text-[#9AA6AD]">
                {p.provincia} · {p.categoria}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-[#9AA6AD] py-4 text-center">
          No encontramos productos.
        </p>
      )}
    </div>
  </div>
)}

      </div>

    </div>
  </div>
)}
            {publicarAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#151B1D] border border-[#2A3639] rounded-2xl max-w-md w-full p-5 relative shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

            <button
              onClick={() => setPublicarAbierto(false)}
              className="absolute top-3 right-3 text-[#9AA6AD] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#F2F4F5] mb-1">
  Publicar producto
</h2>

<p className="text-sm text-[#8FA0A6] mb-5">
  Completa los datos de tu producto
</p>

            <div className="space-y-3">

              <input
                type="text"
                placeholder="Nombre del producto"
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
                className="w-full bg-[#0D1113] border border-[#303C40] text-[#F2F4F5] placeholder:text-[#718087] rounded-xl px-3 py-3 outline-none focus:border-[#7EE2C0] focus:ring-1 focus:ring-[#7EE2C0]/30 transition-all"
              />

              <input
                type="number"
                placeholder="Precio"
                value={precioProducto}
                onChange={(e) => setPrecioProducto(e.target.value)}
                className="w-full bg-[#0D1113] border border-[#303C40] text-[#F2F4F5] placeholder:text-[#718087] rounded-xl px-3 py-3 outline-none focus:border-[#7EE2C0] focus:ring-1 focus:ring-[#7EE2C0]/30 transition-all"
              />
              <select
  value={categoriaProducto}
  onChange={(e) => setCategoriaProducto(e.target.value)}
  className={`w-full bg-[#0D1113] border border-[#303C40] rounded-xl px-3 py-3 outline-none focus:border-[#7EE2C0] focus:ring-1 focus:ring-[#7EE2C0]/30 transition-all appearance-none ${
    categoriaProducto ? "text-[#F2F4F5]" : "text-[#718087]"
  }`}
>
  <option value="" disabled>Categoría</option>

  {CATEGORIAS.filter(c => c !== "Todas").map(c => (
    <option key={c} value={c} className="bg-[#0D1113] text-[#F2F4F5]">
      {c}
    </option>
  ))}
</select>

<select
  value={provinciaProducto}
  onChange={(e) => setProvinciaProducto(e.target.value)}
  className={`w-full bg-[#0D1113] border border-[#303C40] rounded-xl px-3 py-3 outline-none focus:border-[#7EE2C0] focus:ring-1 focus:ring-[#7EE2C0]/30 transition-all appearance-none ${
    provinciaProducto ? "text-[#F2F4F5]" : "text-[#718087]"
  }`}
>
  <option value="" disabled>Provincia</option>

  {PROVINCIAS.filter(p => p !== "Todas").map(p => (
    <option key={p} value={p} className="bg-[#0D1113] text-[#F2F4F5]">
      {p}
    </option>
  ))}
</select>

<select
  value={monedaProducto}
  onChange={(e) => setMonedaProducto(e.target.value)}
  className={`w-full bg-[#0D1113] border border-[#303C40] rounded-xl px-3 py-3 outline-none focus:border-[#7EE2C0] focus:ring-1 focus:ring-[#7EE2C0]/30 transition-all appearance-none ${
    monedaProducto ? "text-[#F2F4F5]" : "text-[#718087]"
  }`}
>
  <option value="" disabled>Moneda</option>
  <option value="CUP" className="bg-[#0D1113] text-[#F2F4F5]">CUP</option>
  <option value="USD" className="bg-[#0D1113] text-[#F2F4F5]">USD</option>
  <option value="EUR" className="bg-[#0D1113] text-[#F2F4F5]">EUR</option>
</select>

              <label className="w-full flex items-center justify-center gap-2 bg-[#0D1113] border border-[#303C40] hover:border-[#7EE2C0] text-[#F2F4F5] font-semibold py-3 rounded-xl cursor-pointer transition-all">
  <ImageIcon className="w-5 h-5 text-[#7EE2C0]" />
  <span>Elegir fotos</span>

  <input
    type="file"
    accept="image/*"
    multiple
    className="hidden"
    onChange={(e) => {
      const archivos = Array.from(e.target.files || []);

      if (archivos.length > 5) {
        alert("Puedes seleccionar máximo 5 fotos");
        setImagenesProducto(archivos.slice(0, 5));
        return;
      }

      setImagenesProducto(archivos);
    }}
  />
</label>

{imagenesProducto.length > 0 && (
  <p className="text-xs text-[#8a8370] mt-2">
    {imagenesProducto.length}{" "}
    {imagenesProducto.length === 1
      ? "foto seleccionada"
      : "fotos seleccionadas"}
  </p>
)}

              <button
  onClick={enviarProducto}
  disabled={enviandoProducto}
  className="w-full bg-[#1B6B63] text-white font-semibold py-3 rounded-lg"
>
  {enviandoProducto ? "Enviando..." : "Enviar producto"}
</button>

            </div>

          </div>
        </div>
            )}
    {opcionesPublicar && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">

    <div className="relative bg-[#151C1E] border border-[#2A3437] rounded-3xl max-w-sm w-full p-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden">

      {/* ACENTO SUPERIOR */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7EE2C0] via-[#5FBFA5] to-transparent" />

      {/* CERRAR */}
      <button
        onClick={() => setOpcionesPublicar(false)}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#202A2D] border border-[#303B3E] flex items-center justify-center text-[#9AA6AD] hover:text-white active:scale-95 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ICONO */}
      <div className="w-12 h-12 rounded-2xl bg-[#7EE2C0]/10 border border-[#7EE2C0]/20 flex items-center justify-center mb-5">
        <Plus
          className="w-6 h-6 text-[#7EE2C0]"
          strokeWidth={2.5}
        />
      </div>

      {/* TITULO */}
      <h2 className="text-2xl font-black tracking-tight text-[#F2F4F5] mb-2">
        Publica en MercadoCU
      </h2>

      <p className="text-sm leading-6 text-[#9AA6AD] mb-6 pr-6">
        Inicia sesión si ya tienes una cuenta o crea una nueva para comenzar a publicar.
      </p>

      {/* BOTONES */}
      <div className="space-y-3">

        <button
          onClick={() => {
            setOpcionesPublicar(false);
            setSesionError("");
            setIniciarSesionAbierto(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#7EE2C0] text-[#0D1113] font-bold py-3.5 rounded-2xl shadow-[0_8px_25px_rgba(126,226,192,0.12)] active:scale-[0.98] transition-all"
        >
          <LogIn className="w-5 h-5" />
          Iniciar sesión
        </button>

        <button
          onClick={() => {
            setOpcionesPublicar(false);
            setVolverA("publicar");
            setCrearCuentaAbierto(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#202A2D] border border-[#354145] text-[#F2F4F5] font-semibold py-3.5 rounded-2xl hover:bg-[#273235] active:scale-[0.98] transition-all"
        >
          <UserRound className="w-5 h-5 text-[#7EE2C0]" />
          Crear cuenta
        </button>

      </div>

      {/* PIE */}
      <p className="text-[10px] text-center text-[#68757A] mt-5">
        MercadoCU · Compra y vende de forma sencilla
      </p>

    </div>
  </div>
)}
    {tendenciasAbierto && (
  <Tendencias
    onCerrar={() => setTendenciasAbierto(false)}
  />
)}

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
<nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1113]/95 backdrop-blur-xl border-t border-[#2A3033] shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">

  <div className="max-w-2xl mx-auto h-[72px] grid grid-cols-5 items-center px-2">

    {/* INICIO */}
    <button
      onClick={() => {
        setPublicarAbierto(false);
        setMisProductosAbierto(false);
        setBuscarAbierto(false);
        setMenuAbierto(false);
        setBusqueda("");
        setProductoDestino(null);
        setProductoDestacado(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="h-full flex flex-col items-center justify-center gap-1 text-[#7EE2C0] transition-all active:scale-95"
    >
      <Home className="w-5 h-5" strokeWidth={2} />
      <span className="text-[10px] font-semibold">
        Inicio
      </span>
    </button>


    {/* BUSCAR */}
    <button
      onClick={() => setBuscarAbierto(true)}
      className="h-full flex flex-col items-center justify-center gap-1 text-[#9AA6AD] hover:text-[#F2F4F5] transition-all active:scale-95"
    >
      <Search className="w-5 h-5" strokeWidth={2} />
      <span className="text-[10px] font-semibold">
        Buscar
      </span>
    </button>


    {/* PUBLICAR */}
<button
  onClick={() => {
    if (!usuarioActual) {
      setOpcionesPublicar(true);
      return;
    }

    setPublicarAbierto(true);
  }}
  className="h-full flex flex-col items-center justify-center gap-1 text-[#7EE2C0] active:scale-95 transition-all"
>
  <div className="relative -mt-7">

    <div className="w-14 h-14 rounded-full bg-[#7EE2C0] text-[#0D1113] flex items-center justify-center shadow-[0_6px_25px_rgba(126,226,192,0.25)] border-4 border-[#0D1113]">
      <Plus className="w-7 h-7" strokeWidth={2.5} />
    </div>

  </div>

  <span className="text-[10px] font-bold -mt-1">
    Publicar
  </span>
</button>


    {/* MIS PRODUCTOS */}
<button
  onClick={() => {
    if (!usuarioActual) {
      setOpcionesPublicar(true);
      return;
    }

    buscarMisProductos();
  }}
  className="h-full flex flex-col items-center justify-center gap-1 text-[#9AA6AD] hover:text-[#F2F4F5] transition-all active:scale-95"
>
  <Package className="w-5 h-5" strokeWidth={2} />
  <span className="text-[10px] font-semibold">
    Mis productos
  </span>
</button>


    {/* TÚ / MÁS */}
    <button
      onClick={() => setMenuAbierto(!menuAbierto)}
      className="h-full flex flex-col items-center justify-center gap-1 text-[#9AA6AD] hover:text-[#F2F4F5] transition-all active:scale-95"
    >

      {usuarioActual ? (
        <div className="relative">

          <div className="w-6 h-6 rounded-full bg-[#1B6B63] border border-[#3A827A] flex items-center justify-center text-white text-[9px] font-bold">
            {usuarioActual.nombre
              ? usuarioActual.nombre
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map(parte => parte[0])
                  .join("")
                  .toUpperCase()
              : "U"}
          </div>

          <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full bg-[#79D6A3] border border-[#0D1113]" />

        </div>
      ) : (
        <UserRound className="w-5 h-5" strokeWidth={2} />
      )}

      <span className="text-[10px] font-semibold">
        Tú
      </span>

    </button>

  </div>

</nav>

    </div>
  );
}
function Tendencias({ onCerrar }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(API_URL + "?accion=tendencias")
      .then(res => res.json())
      .then(data => {
        setDatos(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error("Error cargando tendencias:", error);
        setDatos([]);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0D1113] overflow-y-auto pb-24">

      <div className="max-w-2xl mx-auto px-4 pt-5">

        <div className="flex items-center justify-between mb-6">

          <button
            onClick={onCerrar}
            className="text-[#9AA6AD] text-sm"
            >
            ← Volver
          </button>

          <h1 className="text-xl font-bold text-[#F2F4F5]">
            🔥 Tendencias
          </h1>

          <div className="w-12" />

        </div>

        {cargando ? (
          <div className="text-center py-16 text-[#9AA6AD]">
            Cargando tendencias...
          </div>

        ) : datos.length === 0 ? (
          <div className="text-center py-16 text-[#9AA6AD]">
            Todavía no hay productos con suficiente actividad.
          </div>

        ) : (
          <div className="space-y-4">

            {datos.map((item, index) => {

              const foto = String(
                item["Foto del Producto"] || ""
              )
                .split("||")
                .map(url => url.trim())
                .filter(Boolean)[0] || "";
            return (
                <div
                  key={item._fila || index}
                  className="bg-[#151B1E] border border-[#2A3033] rounded-2xl overflow-hidden"
                >

                  <div className="flex gap-4 p-3">

                    {foto ? (
                      <img
                        src={foto.replace(
                          "uc?export=view&id=",
                          "thumbnail?sz=w300&id="
                        )}
                        onError={(e) => {
                          e.currentTarget.src = foto;
                        }}
                        alt={item["Nombre del producto"] || "Producto"}
                        className="w-24 h-24 rounded-xl object-cover bg-[#0B0F11]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-[#0B0F11] flex items-center justify-center text-[#69757B] text-xs">
                        Sin foto
                      </div>
                    )}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <div className="flex-1 min-w-0">

                          <p className="text-xs text-[#C4472B] font-bold mb-1">
                            #{index + 1} EN TENDENCIA
                          </p>

                          <h2 className="font-bold text-[#F2F4F5] truncate">
                            {item["Nombre del producto"] || "Producto"}
                          </h2>

                          <p className="text-xs text-[#9AA6AD] mt-1">
                            {item["Provincia"] || ""}
                          </p>

                        </div>

                        <div className="text-right shrink-0">

                          <p className="text-lg font-bold text-[#7EE2C0]">
                            {Number(item.puntuacion || 0).toFixed(1)}
                          </p>

                          <p className="text-[10px] text-[#69757B]">
                            puntos
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">

                        <span className="text-[10px] bg-[#202629] text-[#9AA6AD] px-2 py-1 rounded-lg">
                          👁 {item.visualizaciones || 0}
                        </span>

                        <span className="text-[10px] bg-[#202629] text-[#9AA6AD] px-2 py-1 rounded-lg">
                          ♥ {item.meGusta || 0}
                        </span>

                        <span className="text-[10px] bg-[#202629] text-[#9AA6AD] px-2 py-1 rounded-lg">
                          Guardados {item.guardados || 0}
                        </span>

                        <span className="text-[10px] bg-[#202629] text-[#9AA6AD] px-2 py-1 rounded-lg">
                          WhatsApp {item.whatsapp || 0}
                          </span>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}
export default function App() {
  const esAdmin = window.location.hash === "#admin";
  return esAdmin ? <PanelAdmin /> : <Tienda />;
                    }
