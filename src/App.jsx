import React, { useState, useMemo, useEffect } from "react";
import { MapPin, X, MessageCircle, Store, ChevronRight, Tag, Check, Lock, SlidersHorizontal, UserRound, LogIn, Settings, CircleHelp, Headphones, Info, Home, Search, Plus, Package, MoreHorizontal, Flame, BadgeCheck, Truck, Eye,
EyeOff, LogOut, } from "lucide-react";

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

  const foto = fila["Foto del Producto"] || "";

const fotoDirecta = foto.includes("drive.google.com/file/d/")
  ? "https://drive.google.com/uc?export=view&id=" + foto.split("/d/")[1].split("/")[0]
  : foto;
  return {
    id: index,
    _fila: fila._fila,
    nombre: fila["Nombre del producto"] || "",
    categoria: fila["Categoría"] || "",
    provincia: fila["Provincia"] || "",
    precio: fila["Precio"] || "",
    moneda: fila["Moneda"] || "",
    vendedor: fila["Tu nombre (como quieres que aparezca en el anuncio)"] || "",
    tel: fila["Tu número de WhatsApp"] || "",
    foto: fotoDirecta,
    estado: fila["Estado"] || "EN VENTA",
  };
}

function EtiquetaPrecio({ precio, moneda }) {
  return (
    <div
      className="relative inline-flex items-center gap-1 bg-[#E8A33D] text-[#232620] px-3 py-1 font-mono text-sm font-bold shadow-sm"
      style={{ clipPath: "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)" }}
    >
      <span className="pl-1">{precio} {moneda}</span>
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
  <div className="w-full h-48 rounded-xl flex items-center justify-center bg-white overflow-hidden mt-3">
    <img
      src={p["Foto del Producto"].replace(
        "uc?export=view&id=",
        "thumbnail?sz=w1000&id="
      )}
      alt={p["Nombre del producto"]}
      className="w-full h-full object-contain"
    />
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
  const [cargandoMisProductos, setCargandoMisProductos] = useState(false);
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
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
const [imagenProducto, setImagenProducto] = useState(null);
  const [enviandoProducto, setEnviandoProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
const [editandoProducto, setEditandoProducto] = useState(false);
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

      alert("Producto marcado como vendido");

    } else {

      alert("No se pudo marcar");

    }

  } catch (error) {

    alert("Error al marcar el producto");

  }

};
const enviarProducto = async () => {
  if (!usuarioActual || !nombreProducto || !precioProducto || !imagenProducto) {
    alert("Completa todos los campos y selecciona una foto");
    return;
  }

  setEnviandoProducto(true);

  try {
    const lector = new FileReader();

    lector.onloadend = async () => {
      const base64 = lector.result.split(",")[1];

      const datos = {
  nombreProducto: nombreProducto,
  categoria: categoriaProducto,
  provincia: provinciaProducto,
  moneda: monedaProducto,
  precio: precioProducto,

  // Datos de la cuenta actualmente iniciada
  whatsapp: usuarioActual.whatsapp,
  nombreVendedor: usuarioActual.nombre,
  idVendedor: usuarioActual.idVendedor,

  imagen: base64,
  tipo: imagenProducto.type,
  nombre: imagenProducto.name
};

      const formulario = new URLSearchParams();

Object.keys(datos).forEach((clave) => {
  formulario.append(clave, datos[clave]);
});

const respuesta = await fetch(
  "https://script.google.com/macros/s/AKfycby16A5ELOrZAE2QubflsJp9j6EQx34erkLCPD4TcIL18RvvDVCU5yVbOFZMn-Tfe0UU/exec",
  {
    method: "POST",
    body: formulario
  }
);

      const resultado = await respuesta.json();

      if (resultado.exito) {
        alert("Producto enviado para aprobación");
        setPublicarAbierto(false);
      } else {
        alert("Error: " + JSON.stringify(resultado));
      }

      setEnviandoProducto(false);
    };

    lector.readAsDataURL(imagenProducto);

  } catch (error) {
  alert("ERROR REAL: " + error.toString());
  setEnviandoProducto(false);
  }
};
  useEffect(() => {
  fetch(`${API_URL}?accion=aprobados`)
    .then((res) => res.json())
    .then((data) => {
      setProductos(data.map(mapearProducto));
    })
    .catch(() => {});

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

  return (
    <div className="min-h-screen bg-[#EDE6D6] text-[#232620]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="relative bg-[#1B6B63] text-[#F5F1E6] border-b-4 border-[#C4472B]">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Store className="w-7 h-7" strokeWidth={2.5} />
              <span
                className="text-2xl tracking-tight font-extrabold uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em" }}
              >
                Mercado<span className="text-[#E8A33D]">CU</span>
              </span>
            </div>
            <button
  onClick={() => setPublicarAbierto(true)}
  className="bg-[#C4472B] hover:bg-[#a83a23] transition-colors text-white text-sm font-semibold px-4 py-2 rounded-full"
>
  Publicar mi producto
</button>

            <div className="absolute top-5 right-5">
  <button
  onClick={() => setMenuAbierto(!menuAbierto)}
  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
>
  {usuarioActual ? (
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-[#1B6B63] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
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

      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
    </div>
  ) : (
    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white">
      <UserRound className="w-5 h-5" />
    </div>
  )}
</button>

  {menuAbierto && (
    <div className="fixed inset-x-0 bottom-0 bg-white text-[#232620] rounded-t-3xl shadow-2xl p-5 z-50 max-h-[85vh] overflow-y-auto">
<div className="flex items-center justify-between mb-5">
  <div>
    <p className="text-xs uppercase tracking-wider text-[#8a8370] font-semibold">
      MercadoCU
    </p>
    <h2 className="text-2xl font-bold text-[#232620]">
      Más
    </h2>
  </div>

  <button
    onClick={() => setMenuAbierto(false)}
    className="w-10 h-10 rounded-full bg-[#EDE6D6] flex items-center justify-center hover:bg-[#ddd6c4] transition"
  >
    <X className="w-5 h-5" />
  </button>
</div>
      <div className="flex items-center gap-2 mt-3 mb-2 px-2">
  <UserRound className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#8a8370]">
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
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-xl"
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
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-xl"
    >
      <LogIn className="w-5 h-5 text-[#1B6B63]" />
      Iniciar sesión
    </button>
  </>
) : (
  <>
    <div className="px-3 py-3 mb-1 bg-[#EDE6D6] rounded-xl">
      <p className="text-xs text-[#8a8370]">
        Sesión iniciada
      </p>
      <p className="font-bold text-[#232620]">
        {usuarioActual.nombre}
      </p>
    </div>

    <button
      onClick={buscarMisProductos}
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-xl"
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
      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-xl text-[#C4472B]"
    >
      <LogOut className="w-5 h-5" />
      Cerrar sesión
    </button>
  </>
)}
      <div className="flex items-center gap-2 mt-5 mb-2 px-2">
  <Store className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#8a8370]">
    MercadoCU
  </p>
</div>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#EDE6D6] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#fff3d9] flex items-center justify-center">
      <Flame className="w-5 h-5 text-[#C4472B]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#232620]">
        Tendencias
      </p>
      <p className="text-[11px] text-[#8a8370]">
        Lo que más se está buscando
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#8a8370]" />
</button>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#EDE6D6] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#e6efec] flex items-center justify-center">
      <Store className="w-5 h-5 text-[#1B6B63]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#232620]">
        Tiendas
      </p>
      <p className="text-[11px] text-[#8a8370]">
        Descubre tiendas y vendedores
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#8a8370]" />
</button>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#EDE6D6] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#fff3d9] flex items-center justify-center">
      <BadgeCheck className="w-5 h-5 text-[#E8A33D]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#232620]">
        Verificados
      </p>
      <p className="text-[11px] text-[#8a8370]">
        Vendedores y tiendas de confianza
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#8a8370]" />
</button>
      <div className="flex items-center gap-2 mt-5 mb-2 px-2">
  <Truck className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#8a8370]">
    Servicios
  </p>
</div>
      <button
  onClick={() => {
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  className="w-full flex items-center justify-between text-left px-3 py-3 hover:bg-[#EDE6D6] rounded-xl transition"
>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#e6efec] flex items-center justify-center">
      <Truck className="w-5 h-5 text-[#1B6B63]" />
    </div>

    <div>
      <p className="font-semibold text-sm text-[#232620]">
        Domicilios
      </p>
      <p className="text-[11px] text-[#8a8370]">
        Encuentra servicios de entrega
      </p>
    </div>
  </div>

  <ChevronRight className="w-4 h-4 text-[#8a8370]" />
</button>
      <div className="flex items-center gap-2 mt-5 mb-2 px-2">
  <Settings className="w-4 h-4 text-[#1B6B63]" />
  <p className="text-xs uppercase tracking-wider font-bold text-[#8a8370]">
    Ayuda y configuración
  </p>
</div>

      <button className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
  <Settings className="w-5 h-5 text-[#1B6B63]" />
  Configuración
</button>

      <button className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
  <CircleHelp className="w-5 h-5 text-[#1B6B63]" />
  Ayuda
</button>

      <button className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
  <Headphones className="w-5 h-5 text-[#1B6B63]" />
  Soporte
</button>

      <button className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
  <Info className="w-5 h-5 text-[#1B6B63]" />
  Acerca de MercadoCU
</button>

    </div>
  )}
              {crearCuentaAbierto && (
  <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 shadow-2xl">

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#8a8370] font-semibold">
            MercadoCU
          </p>

          <h2 className="text-2xl font-bold text-[#232620]">
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
          className="w-10 h-10 rounded-full bg-[#232620] text-white flex items-center justify-center hover:bg-[#1B6B63] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {registroPaso === 1 && (
  <>
    <p className="text-sm text-[#5c5848] mb-4">
      ¿Cómo quieres utilizar MercadoCU?
    </p>

    <div className="space-y-3">

        <button
  onClick={() => setTipoCuenta("vendedor")}
  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition text-left ${
    tipoCuenta === "vendedor"
      ? "border-2 border-[#1B6B63] bg-[#e6efec]"
      : "border border-[#eee7d8] hover:bg-[#faf8f2]"
  }`}
>
          <div className="w-11 h-11 rounded-xl bg-[#e6efec] flex items-center justify-center">
            <UserRound className="w-6 h-6 text-[#1B6B63]" />
          </div>

          <div>
            <p className="font-bold text-[#232620]">
              Vendedor
            </p>
            <p className="text-xs text-[#8a8370]">
              Publica y vende tus productos
            </p>
          </div>
        </button>

        <button
  onClick={() => setTipoCuenta("tienda")}
  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition text-left ${
    tipoCuenta === "tienda"
      ? "border-2 border-[#1B6B63] bg-[#e6efec]"
      : "border border-[#eee7d8] hover:bg-[#faf8f2]"
  }`}
>
          <div className="w-11 h-11 rounded-xl bg-[#e6efec] flex items-center justify-center">
            <Store className="w-6 h-6 text-[#1B6B63]" />
          </div>

          <div>
            <p className="font-bold text-[#232620]">
              Tienda
            </p>
            <p className="text-xs text-[#8a8370]">
              Impulsa tu negocio dentro de MercadoCU
            </p>
          </div>
        </button>

        <button
  onClick={() => setTipoCuenta("mensajero")}
  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition text-left ${
    tipoCuenta === "mensajero"
      ? "border-2 border-[#1B6B63] bg-[#e6efec]"
      : "border border-[#eee7d8] hover:bg-[#faf8f2]"
  }`}
>
          <div className="w-11 h-11 rounded-xl bg-[#e6efec] flex items-center justify-center">
            <Truck className="w-6 h-6 text-[#1B6B63]" />
          </div>

          <div>
            <p className="font-bold text-[#232620]">
              Mensajero
            </p>
            <p className="text-xs text-[#8a8370]">
              Ofrece servicios de domicilio
            </p>
          </div>
        </button>

      </div>
      {tipoCuenta && (
  <button
    onClick={() => setRegistroPaso(2)}
    className="w-full mt-5 bg-[#1B6B63] text-white font-bold py-3 rounded-xl hover:bg-[#14534e] transition"
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
      className="flex items-center gap-2 text-sm text-[#1B6B63] font-semibold mb-5"
    >
      ← Atrás
    </button>

    <h3 className="text-xl font-bold text-[#232620]">
      {tipoCuenta === "vendedor" && "Crear cuenta de vendedor"}
      {tipoCuenta === "tienda" && "Crear cuenta de tienda"}
      {tipoCuenta === "mensajero" && "Crear cuenta de mensajero"}
    </h3>

    <p className="text-sm text-[#8a8370] mt-1 mb-5">
      Solo necesitamos unos datos básicos para comenzar.
    </p>

    <div className="space-y-4">

      <div>
        <label className="block text-sm font-semibold text-[#232620] mb-1">
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
  className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 outline-none focus:border-[#1B6B63] text-[#232620]"
/>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#232620] mb-1">
          WhatsApp
        </label>

        <input
  type="tel"
  placeholder="Tu número de WhatsApp"
  value={whatsappRegistro}
  onChange={(e) => setWhatsappRegistro(e.target.value)}
  className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 outline-none focus:border-[#1B6B63] text-[#232620]"
/>
      </div>

            <div>
        <label className="block text-sm font-semibold text-[#232620] mb-1">
          Contraseña
        </label>

        <div className="relative">
          <input
            type={mostrarPin ? "text" : "password"}
            placeholder="Crea una contraseña"
            value={pinRegistro}
            onChange={(e) => setPinRegistro(e.target.value)}
            className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#1B6B63] text-[#232620]"
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMostrarPin(!mostrarPin)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#6f6a5c] hover:text-[#1B6B63]"
            aria-label={mostrarPin ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrarPin ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <label className="block text-sm font-semibold text-[#232620] mt-4 mb-1">
          Confirmar contraseña
        </label>

        <div className="relative">
          <input
            type={mostrarPin ? "text" : "password"}
            placeholder="Repite tu contraseña"
            value={confirmarPinRegistro}
            onChange={(e) => setConfirmarPinRegistro(e.target.value)}
            className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#1B6B63] text-[#232620]"
          />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMostrarPin(!mostrarPin)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#6f6a5c] hover:text-[#1B6B63]"
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
  className="w-full mt-6 bg-[#1B6B63] text-white font-bold py-3 rounded-xl hover:bg-[#14534e] transition"
>
  Crear mi cuenta
</button>

  </div>
)}

    </div>
  </div>
)}
</div>
          </div>
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
      </header>

      <div className="max-w-6xl mx-auto px-5 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 border border-[#ddd6c4] rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-[#8a8370]" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar un producto..."
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="border border-[#ddd6c4] rounded-xl px-4 py-3 text-sm bg-white"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
  className="bg-[#1B6B63] hover:bg-[#15554f] text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
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
  className="bg-[#C4472B] hover:bg-[#a83a23] text-white px-6 py-3 rounded-xl font-semibold transition"
>
  Limpiar
</button>

{filtrosAbiertos && (
  <div className="w-full bg-white border border-[#ddd6c4] rounded-2xl p-4 shadow-lg mt-3">
    <h3 className="text-sm font-semibold mb-3">
      Filtros
    </h3>
<label className="text-sm font-medium text-[#5c5848]">
  Ordenar por
</label>

<select
  value={orden}
  onChange={e => setOrden(e.target.value)}
  className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 text-sm bg-white mt-2"
>
  <option value="recientes">Más recientes</option>
  <option value="precioMenor">Precio menor a mayor</option>
  <option value="precioMayor">Precio mayor a menor</option>
</select>
     <label className="text-sm font-medium text-[#5c5848] mt-4 block">
      Moneda
    </label>

    <select
      value={moneda}
      onChange={e => setMoneda(e.target.value)}
      className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 text-sm bg-white mt-2"
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
  <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide text-[#5c5848] font-semibold">
    <MapPin className="w-3.5 h-3.5" /> Provincia
  </div>

  <div className="flex gap-2 overflow-x-auto pb-2">
    {PROVINCIAS.map(p => (
      <button
        key={p}
        onClick={() => setProvincia(p)}
        className={`whitespace-nowrap px-3 py-1.5 rounded-sm text-sm font-medium border transition-colors ${
          provincia === p
            ? "bg-[#1B6B63] text-white border-[#1B6B63]"
            : "bg-white text-[#232620] border-[#ddd6c4] hover:border-[#1B6B63]"
        }`}  
          >
              {p}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 mt-6 pb-16">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#5c5848] uppercase tracking-wide">
            {productosFiltrados.length} anuncio{productosFiltrados.length !== 1 ? "s" : ""} encontrado{productosFiltrados.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-sm p-8 text-center text-[#8a8370] text-sm">
            No hay anuncios con esos filtros todavía. Prueba con otra provincia o categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map(p => (
              <div
  key={p.id}
  id={`producto-${p.id}`}
  className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-500 ${
    productoDestacado === p.id
      ? "border-[#E8A33D] shadow-[0_0_0_4px_rgba(232,163,61,0.18),0_12px_35px_rgba(35,38,32,0.18)] scale-[1.015]"
      : "border-[#eee7d8] shadow-sm hover:shadow-xl"
  }`}
>

                {p.foto && (
  <div className="w-full h-64 rounded-xl flex items-center justify-center bg-white">
    <img
  src={p.foto.replace(
    "uc?export=view&id=",
    "thumbnail?sz=w1000&id="
  )}
  alt={p.nombre}
  className="w-full h-full object-contain"
/>
  </div>
)}
                <div className="flex items-start justify-between gap-2">
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-[10px] uppercase font-bold tracking-wide text-[#1B6B63] bg-[#e6efec] px-2 py-0.5 rounded-sm">
      {p.categoria}
    </span>

    {p.estado === "Vendido" ? (
  <span className="text-[10px] uppercase font-bold tracking-wide text-white bg-red-600 px-2 py-0.5 rounded-sm">
    VENDIDO
  </span>
) : p.estado === "Reservado" ? (
  <span className="text-[10px] uppercase font-bold tracking-wide text-white bg-yellow-500 px-2 py-0.5 rounded-sm">
    RESERVADO
  </span>
) : (
  <span className="text-[10px] uppercase font-bold tracking-wide text-white bg-green-600 px-2 py-0.5 rounded-sm">
    EN VENTA
  </span>
)}
  </div>

  <span className="text-[11px] text-[#8a8370] flex items-center gap-1">
    <MapPin className="w-3 h-3" /> {p.provincia}
  </span>
</div>
                <h3 className="font-semibold text-lg text-[#232620] leading-tight">
  {p.nombre}
</h3>
                <div className="flex items-center justify-between mt-1">
                  <EtiquetaPrecio precio={p.precio} moneda={p.moneda} />
                  <span className="text-xs text-[#8a8370] font-medium">{p.vendedor}</span>
                </div>
                <button
  onClick={() => setSeleccionado(p)}
  className="mt-1 flex items-center justify-center gap-2 bg-[#C4472B] hover:bg-[#a83a23] transition text-white text-sm font-semibold py-3 rounded-xl"
>
  Ver producto <ChevronRight className="w-4 h-4" />
</button>
              </div>
            ))}
          </div>
        )}
      </main>

      <section className="bg-[#232620] text-[#F5F1E6] py-10">
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
  onClick={() => setPublicarAbierto(true)}
  className="bg-[#E8A33D] text-[#232620] font-bold px-6 py-3 rounded-xl hover:bg-[#d99429] transition whitespace-nowrap"
>
  Quiero publicar
</button>
        </div>
      </section>

      {seleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 relative shadow-xl">
            <button onClick={() => setSeleccionado(null)} className="absolute top-3 right-3 text-[#8a8370] hover:text-[#232620]">
              <X className="w-5 h-5" />
            </button>
            <span className="inline-block text-[10px] uppercase font-bold tracking-wide text-[#1B6B63] bg-[#e6efec] px-2 py-1 rounded-sm">
  {seleccionado.categoria}
</span>
            <h3 className="font-bold text-xl mt-2 text-[#232620]">
  {seleccionado.nombre}
</h3>
            <p className="text-sm text-[#8a8370] mt-1">
  Vendedor: {seleccionado.vendedor} · {seleccionado.provincia}
</p>

<div className="mt-3">
  <EtiquetaPrecio
    precio={seleccionado.precio}
    moneda={seleccionado.moneda}
  />
</div>
            <p className="text-sm text-[#5c5848] mt-4 leading-relaxed">
              El pago y la entrega se coordinan directo con el vendedor. Al tocar el botón, se abriría un chat de WhatsApp con el pedido ya escrito.
            </p>
            <button
  onClick={() => {
    const numero = `53${String(seleccionado.tel).replace(/\s+/g, "")}`;

    const mensaje = `Hola, estoy interesado en el producto "${seleccionado.nombre}". ¿Sigue disponible?`;

console.log(seleccionado);

window.open(
  `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
  "_blank"
);
  }}
  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1B6B63] hover:bg-[#155650] transition-colors text-white font-semibold py-2.5 rounded-sm"
>
  <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
</button>
          </div>
        </div>
      )}

      {iniciarSesionAbierto && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-sm w-full p-5 relative shadow-xl">

      <button
        onClick={() => {
          setIniciarSesionAbierto(false);
          setWhatsappSesion("");
          setPinSesion("");
          setSesionError("");
        }}
        className="absolute top-3 right-3 text-[#8a8370]"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold mb-1">
        Iniciar sesión
      </h2>

      <p className="text-sm text-[#8a8370] mb-5">
        Accede a tu cuenta de MercadoCU
      </p>

      <label className="block text-sm font-semibold text-[#232620] mb-1">
        WhatsApp
      </label>

      <input
        type="tel"
        placeholder="Tu número de WhatsApp"
        value={whatsappSesion}
        onChange={(e) => setWhatsappSesion(e.target.value)}
        className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 mb-4 outline-none focus:border-[#1B6B63] text-[#232620]"
      />

      <label className="block text-sm font-semibold text-[#232620] mb-1">
        Contraseña
      </label>

      <div className="relative">
        <input
          type={mostrarPinSesion ? "text" : "password"}
          placeholder="Tu contraseña"
          value={pinSesion}
          onChange={(e) => setPinSesion(e.target.value)}
          className="w-full border border-[#ddd6c4] rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#1B6B63] text-[#232620]"
        />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setMostrarPinSesion(!mostrarPinSesion)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#6f6a5c] hover:text-[#1B6B63]"
          aria-label={
            mostrarPinSesion
              ? "Ocultar contraseña"
              : "Mostrar contraseña"
          }
        >
          {mostrarPinSesion ? (
            <EyeOff size={18} strokeWidth={1.8} />
          ) : (
            <Eye size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {sesionError && (
        <p className="text-red-600 text-sm mt-3">
          {sesionError}
        </p>
      )}

      <button
        onClick={iniciarSesion}
        disabled={cargandoSesion}
        className="w-full mt-5 bg-[#1B6B63] text-white font-bold py-3 rounded-xl hover:bg-[#14534e] transition"
      >
        {cargandoSesion ? "Entrando..." : "Iniciar sesión"}
      </button>

    </div>
  </div>
)}
        {misProductosAbierto && (
  <div className="fixed inset-0 bg-black/50 overflow-y-auto p-4 z-50">
    <div className="bg-white rounded-lg max-w-sm w-full p-5 relative shadow-xl mx-auto mt-10 mb-10">

      <button
        onClick={() => setMisProductosAbierto(false)}
        className="absolute top-3 right-3 text-[#8a8370]"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold mb-4">
        Mis productos
      </h2>

      {cargandoMisProductos ? (
  <p className="text-center text-[#5c5848] py-4">
    Cargando tus productos...
  </p>
) : misProductos.length === 0 ? (
  <p className="text-center text-[#5c5848] py-4">
    No tienes productos publicados todavía.
  </p>
) : null}
      {misProductos.length > 0 && (
  <div className="mt-4">
    <h3 className="font-bold mb-2">
      Tus productos:
    </h3>

    {misProductos.map((p, index) => (
  <div key={index} className="border rounded-lg p-3 mb-2">
    {p["Estado"] === "Vendido" && (
  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-2">
    VENDIDO
  </div>
)}
    <p className="font-semibold">
      {p["Nombre del producto"]}
    </p>

    <p>
      {p["Precio"]} {p["Moneda"]}
    </p>

    <button
      onClick={() => eliminarProducto(p._fila)}
      className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg"
    >
      Eliminar producto
    </button>
    <button
  onClick={() => abrirEdicion(p)}
  className="mt-2 w-full bg-[#1B6B63] text-white py-2 rounded-lg"
>
  Editar producto
</button>
    <button
  onClick={() => marcarReservado(p._fila)}
  className="mt-2 w-full bg-yellow-500 text-white py-2 rounded-lg"
>
  Marcar reservado
</button>
    <button
  onClick={() => marcarVendido(p._fila)}
  className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg"
>
  Marcar vendido
</button>
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
  className="w-full mt-4 bg-[#C4472B] text-white font-semibold py-2 rounded-lg"
>
  Cerrar
</button>

    </div>
  </div>
)}
      {editandoProducto && productoEditando && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full p-5 relative shadow-xl">

      <button
        onClick={() => {
          setEditandoProducto(false);
          setProductoEditando(null);
        }}
        className="absolute top-3 right-3 text-[#8a8370]"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold mb-4">
        Editar producto
      </h2>

      <input
        type="text"
        value={nombreProducto}
        onChange={(e) => setNombreProducto(e.target.value)}
        placeholder="Nombre del producto"
        className="w-full border rounded-lg px-3 py-2 mb-3"
      />

      <select
        value={categoriaProducto}
        onChange={(e) => setCategoriaProducto(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-3"
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
        className="w-full border rounded-lg px-3 py-2 mb-3"
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
        className="w-full border rounded-lg px-3 py-2 mb-3"
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
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />
      <div className="mb-4">
  <label className="block text-sm font-semibold mb-2">
    Cambiar foto
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImagenProducto(e.target.files[0] || null)}
    className="w-full border rounded-lg px-3 py-2"
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
  className="w-full bg-[#1B6B63] text-white font-semibold py-3 rounded-lg"
>
  Guardar cambios
</button>

    </div>
  </div>
)}
      {buscarAbierto && (
  <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-md w-full mt-6 shadow-xl overflow-hidden">

      <div className="flex items-center justify-between p-4 border-b border-[#eee7d8]">
        <h2 className="text-lg font-bold text-[#232620]">
          Buscar productos
        </h2>

        <button
          onClick={() => setBuscarAbierto(false)}
          className="text-[#8a8370]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-3">

        <div className="flex items-center gap-2 border border-[#ddd6c4] rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-[#8a8370]" />

          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="w-full outline-none text-sm bg-transparent"
            autoFocus
          />
        </div>
        <p className="text-xs text-[#8a8370] px-1 pt-1">
  Busca productos por nombre o palabra clave
</p>
        {busqueda && (
  <div className="pt-2">
    <p className="text-xs font-semibold text-[#5c5848] mb-2">
      Resultados de búsqueda
    </p>

    <div className="space-y-2 max-h-72 overflow-y-auto">
      {productosFiltrados.length > 0 ? (
        productosFiltrados.map(p => (
          <div
  key={p.id}
  onClick={() => {
     setProductoDestino(p);
    setBusqueda("");
    setBuscarAbierto(false);
  }}
  className="flex items-center gap-3 p-3 rounded-xl border border-[#eee7d8] hover:bg-[#faf8f2] transition-colors cursor-pointer"
>
            {p.foto && (
              <img
                src={p.foto.replace(
                  "uc?export=view&id=",
                  "thumbnail?sz=w200&id="
                )}
                alt={p.nombre}
                className="w-12 h-12 rounded-lg object-contain bg-white"
              />
            )}

            <div className="min-w-0">
              <p className="font-semibold text-sm text-[#232620] truncate">
                {p.nombre}
              </p>

              <p className="text-xs text-[#8a8370]">
                {p.provincia} · {p.categoria}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-[#8a8370] py-4 text-center">
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
          <div className="bg-white rounded-lg max-w-md w-full p-5 relative shadow-xl">

            <button
              onClick={() => setPublicarAbierto(false)}
              className="absolute top-3 right-3 text-[#8a8370]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">
                   </h2>

            <div className="space-y-3">

              <input
                type="text"
                placeholder="Nombre del producto"
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="number"
                placeholder="Precio"
                value={precioProducto}
                onChange={(e) => setPrecioProducto(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <select
  value={categoriaProducto}
  onChange={(e) => setCategoriaProducto(e.target.value)}
  className={`w-full border rounded-lg px-3 py-2 appearance-none bg-white ${
  categoriaProducto ? "text-[#232620]" : "text-[#8fa9b8]"
}`}
>
                <option value="" disabled>Categoría</option>

  {CATEGORIAS.filter(c => c !== "Todas").map(c => (
    <option key={c} value={c}>{c}</option>
  ))}
</select>


<select
  value={provinciaProducto}
  onChange={(e) => setProvinciaProducto(e.target.value)}
  className={`w-full border rounded-lg px-3 py-2 appearance-none bg-white ${
  provinciaProducto ? "text-[#232620]" : "text-[#8fa9b8]"
}`}
>
  <option value="" disabled>Provincia</option>
  {PROVINCIAS.filter(p => p !== "Todas").map(p => (
    <option key={p}>{p}</option>
  ))}
</select>

<select
  value={monedaProducto}
  onChange={(e) => setMonedaProducto(e.target.value)}
  className={`w-full border rounded-lg px-3 py-2 appearance-none bg-white ${
  monedaProducto ? "text-[#232620]" : "text-[#8fa9b8]"
}`}
>
  <option value="" disabled>Moneda</option>
  <option value="CUP">CUP</option>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
</select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagenProducto(e.target.files[0])}
                className="w-full"
              />

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

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#ddd6c7] shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto h-16 grid grid-cols-5">

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
  className="flex flex-col items-center justify-center gap-1 text-[#1B6B63]"
>
  <Home className="w-5 h-5" />
  <span className="text-[10px] font-semibold">Inicio</span>
</button>

          <button
  onClick={() => setBuscarAbierto(true)}
  className="flex flex-col items-center justify-center gap-1 text-[#5c5848]"
>
  <Search className="w-5 h-5" />
  <span className="text-[10px] font-semibold">Buscar</span>
</button>

          <button
  onClick={() => {
    if (!usuarioActual) {
      setCrearCuentaAbierto(true);
      return;
    }

    setPublicarAbierto(true);
  }}
  className="flex flex-col items-center justify-center gap-1 text-[#C4472B]"
>
  <div className="w-10 h-10 -mt-5 rounded-full bg-[#C4472B] text-white flex items-center justify-center shadow-lg border-4 border-[#EDE6D6]">
    <Plus className="w-6 h-6" />
  </div>
  <span className="text-[10px] font-bold">Publicar</span>
</button>

          <button
  onClick={buscarMisProductos}
  className="flex flex-col items-center justify-center gap-1 text-[#5c5848]"
>
  <Package className="w-5 h-5" />
  <span className="text-[10px] font-semibold">Mis productos</span>
</button>

          <button
  onClick={() => setMenuAbierto(!menuAbierto)}
  className="flex flex-col items-center justify-center gap-1 text-[#5c5848]"
>
  <MoreHorizontal className="w-5 h-5" />
  <span className="text-[10px] font-semibold">Más</span>
</button>

        </div>
      </nav>

    </div>
  );
}

export default function App() {
  const esAdmin = window.location.hash === "#admin";
  return esAdmin ? <PanelAdmin /> : <Tienda />;
                    }
