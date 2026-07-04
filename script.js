const STORAGE_KEY = 'stycheck_citas';

let citas = [];
let editandoId = null;
let contadorId = 1;

const tablaCitas = document.getElementById('tablaCitas');
const emptyState = document.getElementById('emptyState');
const alertMsg = document.getElementById('alertMsg');
const formTitle = document.getElementById('formTitle');
const btnText = document.getElementById('btnText');
const btnCancelar = document.getElementById('btnCancelar');

function guardarEnLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
  } catch (error) {
    console.error('No se pudo guardar en localStorage:', error);
  }
}

function cargarDesdeLocalStorage() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    if (!datos) return;

    const citasGuardadas = JSON.parse(datos);
    if (Array.isArray(citasGuardadas) && citasGuardadas.length > 0) {
      citas = citasGuardadas;
      contadorId = citas.reduce((max, cita) => Math.max(max, Number(cita.id) || 0), 0) + 1;
    }
  } catch (error) {
    console.error('No se pudo cargar desde localStorage:', error);
    citas = [];
  }
}

function mostrarAlerta(mensaje, tipo) {
  alertMsg.textContent = mensaje;
  alertMsg.className = 'alert ' + tipo;
  setTimeout(() => {
    alertMsg.className = 'alert';
    alertMsg.textContent = '';
  }, 3000);
}

function limpiarFormulario() {
  document.getElementById('nombreCliente').value = '';
  document.getElementById('servicio').value = '';
  document.getElementById('estilista').value = '';
  document.getElementById('fecha').value = '';
  document.getElementById('hora').value = '';
  document.getElementById('estado').value = 'Pendiente';
}

function guardarCita() {
  const nombre = document.getElementById('nombreCliente').value.trim();
  const servicio = document.getElementById('servicio').value;
  const estilista = document.getElementById('estilista').value;
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const estado = document.getElementById('estado').value;

  if (!nombre || !servicio || !estilista || !fecha || !hora) {
    mostrarAlerta('Por favor completa todos los campos.', 'error');
    return;
  }

  if (editandoId !== null) {
    const idx = citas.findIndex(c => c.id === editandoId);
    if (idx !== -1) {
      citas[idx] = { id: editandoId, nombre, servicio, estilista, fecha, hora, estado };
    }
    mostrarAlerta('Cita actualizada correctamente.', 'success');
    cancelarEdicion();
  } else {
    citas.push({ id: contadorId++, nombre, servicio, estilista, fecha, hora, estado });
    mostrarAlerta('Cita registrada correctamente.', 'success');
  }

  guardarEnLocalStorage();
  renderTabla();
  actualizarEstadisticas();
}

function editarCita(id) {
  const cita = citas.find(c => c.id === id);
  if (!cita) return;

  editandoId = id;

  document.getElementById('nombreCliente').value = cita.nombre;
  document.getElementById('servicio').value = cita.servicio;
  document.getElementById('estilista').value = cita.estilista;
  document.getElementById('fecha').value = cita.fecha;
  document.getElementById('hora').value = cita.hora;
  document.getElementById('estado').value = cita.estado;

  formTitle.textContent = 'Editar Cita';
  btnText.textContent = 'Actualizar cita';
  btnCancelar.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarCita(id) {
  if (!confirm('¿Seguro que deseas eliminar esta cita?')) return;
  citas = citas.filter(c => c.id !== id);

  guardarEnLocalStorage();
  mostrarAlerta('Cita eliminada correctamente.', 'success');
  renderTabla();
  actualizarEstadisticas();
}

function cancelarEdicion() {
  editandoId = null;
  limpiarFormulario();
  formTitle.textContent = 'Nueva Cita';
  btnText.textContent = 'Guardar cita';
  btnCancelar.style.display = 'none';
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return '-';
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}/${y}`;
}

function badgeEstado(estado) {
  const clases = {
    Pendiente: 'badge badge-pendiente',
    Confirmada: 'badge badge-confirmada',
    Cancelada: 'badge badge-cancelada'
  };
  return `<span class="${clases[estado] || 'badge'}">${estado}</span>`;
}

function renderTabla() {
  tablaCitas.innerHTML = '';

  if (citas.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  citas.forEach((cita, idx) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${cita.nombre}</strong></td>
      <td>${cita.servicio}</td>
      <td>${cita.estilista}</td>
      <td>${formatearFecha(cita.fecha)}</td>
      <td>${cita.hora}</td>
      <td>${badgeEstado(cita.estado)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-edit" onclick="editarCita(${cita.id})">Editar</button>
          <button class="btn btn-delete" onclick="eliminarCita(${cita.id})">Eliminar</button>
        </div>
      </td>
    `;
    tablaCitas.appendChild(fila);
  });
}

function actualizarEstadisticas() {
  document.getElementById('totalCitas').textContent = citas.length;
  document.getElementById('totalConfirmadas').textContent = citas.filter(c => c.estado === 'Confirmada').length;
  document.getElementById('totalPendientes').textContent = citas.filter(c => c.estado === 'Pendiente').length;
  document.getElementById('totalCanceladas').textContent = citas.filter(c => c.estado === 'Cancelada').length;
}

document.getElementById('fecha').min = new Date().toISOString().split('T')[0];
cargarDesdeLocalStorage();
renderTabla();
actualizarEstadisticas();