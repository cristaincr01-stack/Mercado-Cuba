import React, { useState, useMemo } from "react";
import { MapPin, Search, X, MessageCircle, Store, ChevronRight, Tag } from "lucide-react";

const PROVINCIAS = [
  "Todas", "La Habana", "Santiago de Cuba", "Villa Clara",
  "Camagüey", "Holguín", "Matanzas", "Pinar del Río", "Cienfuegos"
];

const CATEGORIAS = [
  "Todas", "Electrónica", "Ropa y calzado", "Hogar", "Alimentos", "Belleza", "Vehículos"
];

const PRODUCTOS = [
  { id: 1, nombre: "Ventilador de pie 3 velocidades", categoria: "Hogar", provincia: "La Habana", precio: 45, moneda: "USD", vendedor: "Yosvany R.", tel: "+53 5xxx xxxx" },
  { id: 2, nombre: "Tenis deportivos talla 42", categoria: "Ropa y calzado", provincia: "Santiago de Cuba", precio: 28, moneda: "USD", vendedor: "Marlén P.", tel: "+53 5xxx xxxx" },
  { id: 3, nombre: "Cargador solar portátil", categoria: "Electrónica", provincia: "Villa Clara", precio: 22, moneda: "USD", vendedor: "Osmani F.", tel: "+53 5xxx xxxx" },
  { id: 4, nombre: "Combo de aseo personal", categoria: "Belleza", provincia: "Camagüey", precio: 15, moneda: "USD", vendedor: "Dayana M.", tel: "+53 5xxx xxxx" },
  { id: 5, nombre: "Paquete de pollo 5 lb", categoria: "Alimentos", provincia: "Holguín", precio: 12, moneda: "USD", vendedor: "Reinier C.", tel: "+53 5xxx xxxx" },
  { id: 6, nombre: "Bocina Bluetooth recargable", categoria: "Electrónica", provincia: "La Habana", precio: 33, moneda: "USD", vendedor: "Anabel S.", tel: "+53 5xxx xxxx" },
  { id: 7, nombre: "Pieza de motor eléctrico bici", categoria: "Vehículos", provincia: "Matanzas", precio: 60, moneda: "USD", vendedor: "Leandro G.", tel: "+53 5xxx xxxx" },
  { id: 8, nombre: "Juego de sábanas queen", categoria: "Hogar", provincia: "Pinar del Río", precio: 18, moneda: "USD", vendedor: "Odalys T.", tel: "+53 5xxx xxxx" },
];

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

export default function MercadoCuba() {
  const [provincia, setProvincia] = useState("Todas");
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  const productosFiltrados = useMemo(() => {
    return PRODUCTOS.filter(p => {
      const okProvincia = provincia === "Todas" || p.provincia === provincia;
      const okCategoria = categoria === "Todas" || p.categoria === categoria;
      const okBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return okProvincia && okCategoria && okBusqueda;
    });
  }, [provincia, categoria, busqueda]);

  return (
    <div className="min-h-screen bg-[#EDE6D6] text-[#232620]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header / Cartelera */}
      <header className="bg-[#1B6B63] text-[#F5F1E6] border-b-4 border-[#C4472B]">
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
              className="bg-[#C4472B] hover:bg-[#a83a23] transition-colors text-white text-sm font-semibold px-4 py-2 rounded-sm"
            >
              Publicar mi producto
            </a>
          </div>
          <h1
            className="mt-8 text-4xl sm:text-5xl font-black leading-[0.95] max-w-2xl uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Lo que se vende en tu provincia,<br />todo en un solo cartel.
          </h1>
          <p className="mt-3 text-[#DCE6E0] max-w-xl text-sm sm:text-base">
            Compra y vende directo entre cubanos, por provincia y categoría. Sin intermediarios extranjeros, sin complicaciones.
          </p>
        </div>
      </header>

      {/* Buscador + filtros */}
      <div className="max-w-6xl mx-auto px-5 -mt-6">
        <div className="bg-white rounded-sm shadow-md p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 border border-[#ddd6c4] rounded-sm px-3 py-2">
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
            className="border border-[#ddd6c4] rounded-sm px-3 py-2 text-sm bg-white"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Provincias */}
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

      {/* Listado de productos */}
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
              <div key={p.id} className="bg-white rounded-sm border border-[#e5dfd0] p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wide text-[#1B6B63] bg-[#e6efec] px-2 py-0.5 rounded-sm">
                    {p.categoria}
                  </span>
                  <span className="text-[11px] text-[#8a8370] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.provincia}
                  </span>
                </div>
                <h3 className="font-semibold text-[15px] leading-snug">{p.nombre}</h3>
                <div className="flex items-center justify-between mt-1">
                  <EtiquetaPrecio precio={p.precio} moneda={p.moneda} />
                  <span className="text-[11px] text-[#8a8370]">{p.vendedor}</span>
                </div>
                <button
                  onClick={() => setSeleccionado(p)}
                  className="mt-1 flex items-center justify-center gap-1.5 bg-[#C4472B] hover:bg-[#a83a23] transition-colors text-white text-sm font-semibold py-2 rounded-sm"
                >
                  Comprar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Franja para vendedores */}
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
            className="bg-[#E8A33D] text-[#232620] font-bold px-5 py-2.5 rounded-sm hover:bg-[#d99429] transition-colors whitespace-nowrap"
          >
            Quiero publicar
          </a>
        </div>
      </section>

      {/* Modal de compra */}
      {seleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-sm w-full p-5 relative">
            <button onClick={() => setSeleccionado(null)} className="absolute top-3 right-3 text-[#8a8370] hover:text-[#232620]">
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase font-bold tracking-wide text-[#1B6B63]">{seleccionado.categoria}</span>
            <h3 className="font-bold text-lg mt-1">{seleccionado.nombre}</h3>
            <p className="text-sm text-[#8a8370] mt-1">Vendedor: {seleccionado.vendedor} · {seleccionado.provincia}</p>
            <div className="mt-3"><EtiquetaPrecio precio={seleccionado.precio} moneda={seleccionado.moneda} /></div>
            <p className="text-sm text-[#5c5848] mt-4 leading-relaxed">
              El pago y la entrega se coordinan directo con el vendedor. Al tocar el botón, se abriría un chat de WhatsApp con el pedido ya escrito.
            </p>
            <button className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1B6B63] hover:bg-[#155650] transition-colors text-white font-semibold py-2.5 rounded-sm">
              <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
    }
