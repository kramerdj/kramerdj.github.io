const VERSION = "0.9";              // se usa si no se puede consultar GitHub
const WHATSAPP = "5491141800651";

const ua = navigator.userAgent;
const movil = /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const so = movil ? "movil" : /Windows/i.test(ua) ? "windows" : /Macintosh/.test(ua) ? "mac" : "otro";
document.documentElement.dataset.so = so;

for (const el of document.querySelectorAll("[data-version]")) el.textContent = VERSION;

if (movil) {
  const acciones = document.querySelector("[data-descargas]");
  const compartir = acciones.querySelector("[data-compartir]");
  const estado = document.querySelector("[data-estado]");
  for (const a of acciones.querySelectorAll("a")) a.hidden = true;
  compartir.hidden = false;
  document.querySelector("[data-nota-so]").textContent =
    "La app es para Mac y Windows. Abrí esta página en la compu donde tenés Rekordbox.";
  compartir.addEventListener("click", async () => {
    const datos = { title: document.title, url: location.href };
    if (navigator.share) {
      try {
        await navigator.share(datos);
      } catch (error) {
        if (error.name !== "AbortError") throw error;
      }
      return;
    }
    const manual = "Copiá el link de la barra de direcciones y abrilo en la compu.";
    if (!navigator.clipboard) {
      estado.textContent = manual;
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      estado.textContent = "Link copiado. Pegalo en un mensaje para vos y abrilo en la compu.";
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      estado.textContent = manual;
    }
  });
}

const sistemas = document.querySelector("[data-sistemas]");
const pestanas = [...sistemas.querySelectorAll('[role="tab"]')];
const elegir = (tab, enfocar) => {
  for (const t of pestanas) {
    const activa = t === tab;
    t.setAttribute("aria-selected", String(activa));
    t.tabIndex = activa ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !activa;
  }
  if (enfocar) tab.focus();
};
sistemas.querySelector('[role="tablist"]').hidden = false;
elegir(so === "windows" ? pestanas[1] : pestanas[0], false);
for (const [i, tab] of pestanas.entries()) {
  tab.addEventListener("click", () => elegir(tab, false));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    elegir(pestanas[(i + (e.key === "ArrowRight" ? 1 : pestanas.length - 1)) % pestanas.length], true);
  });
}

if (WHATSAPP) {
  const boton = document.querySelector("[data-whatsapp]");
  boton.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Guido, probé RKB Collection Manager.")}`;
  boton.hidden = false;
}

// La versión y el peso de las descargas salen de la última versión publicada en GitHub,
// así la página se actualiza sola cada vez que se publica una versión nueva.
fetch("https://api.github.com/repos/kramerdj/rkb/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
  .then((r) => (r.ok ? r.json() : null))
  .then((rel) => {
    if (!rel || !rel.tag_name) return;
    const version = rel.tag_name.replace(/^v/, "");
    for (const el of document.querySelectorAll("[data-version]")) el.textContent = version;
    for (const el of document.querySelectorAll("[data-peso]")) {
      const archivo = (rel.assets || []).find((a) => a.name === `RKB-Collection-Manager-${el.dataset.peso}.zip`);
      if (archivo) el.textContent = `${Math.round(archivo.size / 1e6)} MB`;
    }
  })
  .catch(() => {});
