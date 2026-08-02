import React, { useState, useMemo, useEffect } from "react";
import { MapPin, Search, X, MessageCircle, Store, ChevronRight, Tag, Check, Lock, SlidersHorizontal } from "lucide-react";

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
  "https://script.google.com/macros/s/AKfycbyWs2l2XjGA2J2ewcyu-vnV4Pfayw_MHPIiMUb2Cl-GLWLVtj_PCtyegj-taEnYIg1e/exec";

function mapearProducto(fila, index) {
  return {
    id: index,
    nombre: fila["Nombre del producto"] || "",
    categoria: fila["Categoría"] || "",
    provincia: fila["Provincia"] || "",
    precio: fila["Precio"] || "",
    moneda: fila["Moneda"] || "",
    vendedor: fila["Tu nombre (como quieres que aparezca en el anuncio)"] || "",
    tel: fila["Tu número de WhatsApp"] || "",
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
  const [provincia, setProvincia] = useState("Todas");
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [orden, setOrden] = useState("recientes");
  const [moneda, setMoneda] = useState("Todas");
  const [tasas, setTasas] = useState({
  USD: 680,
  EUR: 700,
});

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
        USD: data.usd,
        EUR: data.eur,
      });

          TASAS_CAMBIO.USD = data.USD;
TASAS_CAMBIO.EUR = data.EUR;
    })
    .catch(() => {});
}, []);

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
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScqVcoGremgczIq0KvzoPyciqFDpKpfu79I2IxV6gA3GU7FlA/viewform"
              className="bg-[#C4472B] hover:bg-[#a83a23] transition-colors text-white text-sm font-semibold px-4 py-2 rounded-full"
            >
              Publicar mi producto
            </a>

            <div className="absolute top-5 right-5">
  <button
    onClick={() => setMenuAbierto(!menuAbierto)}
    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition text-white text-3xl font-bold"
  >
    ⋮
  </button>

  {menuAbierto && (
    <div className="absolute right-0 mt-3 w-60 bg-white text-[#232620] rounded-2xl shadow-xl p-3 z-50">

      <button className="w-full text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-xl">
        👤 Crear cuenta
      </button>

      <button className="w-full text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
        🔑 Iniciar sesión
      </button>

      <button className="w-full text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
        ⚙️ Configuración
      </button>

      <button className="w-full text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
        ❓ Ayuda
      </button>

      <button className="w-full text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
        💬 Soporte
      </button>

      <button className="w-full text-left px-3 py-2 hover:bg-[#EDE6D6] rounded-sm">
        ℹ️ Acerca de MercadoCU
      </button>

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
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-[#eee7d8] p-5 flex flex-col gap-4 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wide text-[#1B6B63] bg-[#e6efec] px-2 py-0.5 rounded-sm">
                    {p.categoria}
                  </span>
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
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScqVcoGremgczIq0KvzoPyciqFDpKpfu79I2IxV6gA3GU7FlA/viewform"
            className="bg-[#E8A33D] text-[#232620] font-bold px-6 py-3 rounded-xl hover:bg-[#d99429] transition whitespace-nowrap"
          >
            Quiero publicar
          </a>
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
    </div>
  );
}

export default function App() {
  const esAdmin = window.location.hash === "#admin";
  return esAdmin ? <PanelAdmin /> : <Tienda />;
                    }
