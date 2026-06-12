/**
 * ==============================================================================
 * Módulo Principal del Frontend (script.js)
 * ==============================================================================
 * Este archivo maneja toda la lógica del cliente (navegador).
 * Se encarga de construir la interfaz dinámicamente y hacer las peticiones
 * HTTP (fetch) al backend (app.py) para obtener o guardar datos.
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Función principal encargada de la navegación.
 * Oculta el contenido actual y dibuja la pantalla seleccionada en el menú lateral.
 * @param {Event} event - El evento del click (opcional).
 * @param {string} title - El título de la sección a cargar.
 */
function loadContent(event, title) {
    if (event) {
        event.preventDefault();

        // Marcar menú como activo
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
    }

    const pageTitle = document.getElementById('page-title');
    const contentArea = document.getElementById('content-area');

    pageTitle.textContent = title;

    if (title === 'Clientes') {
        renderClientesView(contentArea);
    } else if (title === 'Productos') {
        renderProductosView(contentArea);
    } else if (title === 'Inventario') {
        renderInventarioView(contentArea);
    } else if (title === 'Facturar') {
        renderFacturarView(contentArea);
    }
}

/**
 * Dibuja la vista principal de la sección "Clientes".
 * Inserta la barra de búsqueda, los filtros y la estructura de la tabla HTML.
 * @param {HTMLElement} container - El contenedor donde se dibujará la interfaz.
 */
function renderClientesView(container) {
    container.innerHTML = `
        <div class="clientes-toolbar">
            <div class="clientes-filters">
                <input type="text" id="clientes-search" placeholder="Buscar por número, nombre o dirección..." oninput="filtrarClientes()">
                <select id="clientes-estado-filter" onchange="cargarClientes()">
                    <option value="todos" selected>Mostrar: Todos</option>
                    <option value="activos">Mostrar: Activos</option>
                    <option value="inactivos">Mostrar: Inactivos</option>
                </select>
            </div>
            <button type="button" class="btn-primary" onclick="openNuevoClienteModal()">+ Registrar Cliente</button>
        </div>

        <div class="table-container">
            <table class="flat-table">
                <thead>
                    <tr>
                        <th>Nro. Cliente</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Dirección</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="clientes-tbody">
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-secondary);">Cargando clientes...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Cargar los clientes inicialmente
    cargarClientes();
}

/**
 * Realiza una petición GET al backend para obtener los clientes.
 * Luego, filtra los resultados si hay una búsqueda activa y dibuja las filas
 * de la tabla dinámicamente en el DOM.
 */
async function cargarClientes() {
    const tbody = document.getElementById('clientes-tbody');
    if (!tbody) return;

    const estadoFilter = document.getElementById('clientes-estado-filter').value;
    const searchQuery = document.getElementById('clientes-search').value.toLowerCase();

    try {
        let url = `${API_BASE_URL}/clientes`;

        if (estadoFilter === 'activos') {
            url = `${API_BASE_URL}/clientes?activo=1`;
        }
        else if (estadoFilter === 'inactivos') {
            url = `${API_BASE_URL}/clientes?activo=0`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
            let clientes = result.data;

            // Filtrado del lado del cliente para búsqueda
            if (searchQuery) {
                clientes = clientes.filter(c =>
                    c.nro_cliente.toString().includes(searchQuery) ||
                    c.nombre.toLowerCase().includes(searchQuery) ||
                    c.apellido.toLowerCase().includes(searchQuery) ||
                    c.direccion.toLowerCase().includes(searchQuery)
                );
            }

            if (clientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-secondary);">No se encontraron clientes.</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = clientes.map(c => {
                const estadoText = c.activo > 0 ? 'Activo' : 'Inactivo';
                const estadoClass = c.activo > 0 ? 'activo' : 'inactivo';

                const actionButton = c.activo > 0
                    ? `<button type="button" class="btn-action eliminar" onclick="openAnularClienteModal(${c.nro_cliente}, '${c.nombre} ${c.apellido}')">Anular</button>`
                    : `<button type="button" class="btn-action activar" onclick="openActivarClienteModal(${c.nro_cliente}, '${c.nombre} ${c.apellido}')">Activar</button>`;

                return `
                    <tr>
                        <td><strong>${c.nro_cliente}</strong></td>
                        <td>${c.nombre}</td>
                        <td>${c.apellido}</td>
                        <td>${c.direccion}</td>
                        <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
                        <td>
                            <div class="btn-action-group">
                                <button type="button" class="btn-action ver" onclick="verCliente(${c.nro_cliente})">Ver</button>
                                <button type="button" class="btn-action editar" onclick="editarCliente(${c.nro_cliente})">Editar</button>
                                ${actionButton}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #b91c1c;">Error al cargar datos: ${result.message}</td>
                </tr>
            `;
        }
    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #b91c1c;">No se pudo conectar con el servidor backend.</td>
            </tr>
        `;
    }
}

/**
 * Filtro con retraso al escribir en la barra de búsqueda de clientes
 */
let clientesSearchTimeout;
function filtrarClientes() {
    clearTimeout(clientesSearchTimeout);
    clientesSearchTimeout = setTimeout(() => {
        cargarClientes();
    }, 200);
}

/* =========================================
   Funciones Auxiliares para Modales
   ========================================= */
function openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;

    const container = document.querySelector('.modal-container');
    let footer = container.querySelector('.modal-footer');
    if (!footerHtml) {
        if (footer) footer.remove();
    } else {
        if (!footer) {
            footer = document.createElement('div');
            footer.className = 'modal-footer';
            container.appendChild(footer);
        }
        footer.innerHTML = footerHtml;
    }

    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

function closeModalOnOverlay(event) {
    if (event.target === document.getElementById('modal-overlay')) {
        closeModal();
    }
}

/* =========================================
   Acciones de Clientes (Modales)
   ========================================= */

/**
 * Visualiza la información del cliente con un mapa simulado
 */
async function verCliente(nro_cliente) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${nro_cliente}`);
        const result = await response.json();
        if (response.ok) {
            const c = result.data;
            const bodyHtml = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <p><strong>Número de Cliente:</strong> ${c.nro_cliente}</p>
                    <p><strong>Nombre completo:</strong> ${c.nombre} ${c.apellido}</p>
                    <p><strong>Dirección registrada:</strong> ${c.direccion}</p>
                    <p><strong>Estado actual:</strong> <span class="status-badge ${c.activo > 0 ? 'activo' : 'inactivo'}">${c.activo > 0 ? 'Activo' : 'Inactivo'}</span></p>
                    
                    <div class="map-container">
                        <img src="mock_map.png" alt="Mapa de ubicación" class="map-img">
                    </div>
                    <div class="map-caption">
                        <span class="material-symbols-outlined">location_on</span>
                        Ubicación aproximada en tiempo real para: <em>${c.direccion}</em>
                    </div>
                </div>
            `;
            const footerHtml = `<button type="button" class="btn-secondary" onclick="closeModal()">Cerrar</button>`;
            openModal('Ver Detalle de Cliente', bodyHtml, footerHtml);
        } else {
            alert('Error al buscar el cliente: ' + result.message);
        }
    } catch (err) {
        alert('Error al conectar con el servidor.');
    }
}

/**
 * Abre el modal para editar los datos de un cliente
 */
async function editarCliente(nro_cliente) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${nro_cliente}`);
        const result = await response.json();
        if (response.ok) {
            const c = result.data;
            const bodyHtml = `
                <form id="modal-cliente-edit-form" onsubmit="saveClienteEdit(event, ${c.nro_cliente})">
                    <div class="form-group">
                        <label>Número de Cliente</label>
                        <input type="number" value="${c.nro_cliente}" disabled style="background-color: #f1f3f4; color: #5f6368;">
                    </div>
                    <div class="form-group">
                        <label for="me_nombre">Nombre</label>
                        <input type="text" id="me_nombre" value="${c.nombre}" required>
                    </div>
                    <div class="form-group">
                        <label for="me_apellido">Apellido</label>
                        <input type="text" id="me_apellido" value="${c.apellido}" required>
                    </div>
                    <div class="form-group">
                        <label for="me_direccion">Dirección</label>
                        <input type="text" id="me_direccion" value="${c.direccion}" required>
                    </div>
                    <div class="form-group">
                        <label for="me_activo">Estado</label>
                        <select id="me_activo">
                            <option value="1" ${c.activo > 0 ? 'selected' : ''}>Activo</option>
                            <option value="0" ${c.activo === 0 ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                    <div id="modal-edit-feedback" class="feedback-msg"></div>
                </form>
            `;
            const footerHtml = `
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button type="submit" form="modal-cliente-edit-form" class="btn-primary">Guardar Cambios</button>
            `;
            openModal('Editar Cliente', bodyHtml, footerHtml);
        } else {
            alert('Error al buscar el cliente: ' + result.message);
        }
    } catch (err) {
        alert('Error al conectar con el servidor.');
    }
}

/**
 * Envía la solicitud PUT para guardar los cambios del cliente editado
 */
async function saveClienteEdit(event, nro_cliente) {
    event.preventDefault();
    const feedback = document.getElementById('modal-edit-feedback');
    feedback.className = 'feedback-msg';
    feedback.style.display = 'block';
    feedback.textContent = 'Guardando...';

    const payload = {
        nombre: document.getElementById('me_nombre').value,
        apellido: document.getElementById('me_apellido').value,
        direccion: document.getElementById('me_direccion').value,
        activo: parseInt(document.getElementById('me_activo').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${nro_cliente}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
            feedback.className = 'feedback-msg success';
            feedback.textContent = 'Cliente modificado con éxito.';
            showToast('Cliente modificado con éxito.');
            setTimeout(() => {
                closeModal();
                cargarClientes();
            }, 800);
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'Error al guardar.';
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'No se pudo conectar con el servidor.';
    }
}

/**
 * Abre el modal para registrar un nuevo cliente
 */
function openNuevoClienteModal() {
    const bodyHtml = `
        <form id="modal-cliente-alta-form" onsubmit="saveNuevoCliente(event)">
            <div class="form-group">
                <label for="ma_nro_cliente">Número de Cliente</label>
                <input type="number" id="ma_nro_cliente" required placeholder="Ej. 1045">
            </div>
            <div class="form-group">
                <label for="ma_nombre">Nombre</label>
                <input type="text" id="ma_nombre" required placeholder="Nombre del cliente">
            </div>
            <div class="form-group">
                <label for="ma_apellido">Apellido</label>
                <input type="text" id="ma_apellido" required placeholder="Apellido del cliente">
            </div>
            <div class="form-group">
                <label for="ma_direccion">Dirección</label>
                <input type="text" id="ma_direccion" required placeholder="Dirección del cliente">
            </div>
            <div id="modal-alta-feedback" class="feedback-msg"></div>
        </form>
    `;
    const footerHtml = `
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" form="modal-cliente-alta-form" class="btn-primary">Guardar Cliente</button>
    `;
    openModal('Registrar Nuevo Cliente', bodyHtml, footerHtml);
}

/**
 * Envía la solicitud POST para guardar un cliente nuevo
 */
async function saveNuevoCliente(event) {
    event.preventDefault();
    const feedback = document.getElementById('modal-alta-feedback');
    feedback.className = 'feedback-msg';
    feedback.style.display = 'block';
    feedback.textContent = 'Registrando...';

    const payload = {
        nro_cliente: parseInt(document.getElementById('ma_nro_cliente').value),
        nombre: document.getElementById('ma_nombre').value,
        apellido: document.getElementById('ma_apellido').value,
        direccion: document.getElementById('ma_direccion').value,
        activo: 1
    };

    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
            feedback.className = 'feedback-msg success';
            feedback.textContent = 'Cliente registrado con éxito.';
            showToast('Cliente registrado con éxito.');
            setTimeout(() => {
                closeModal();
                cargarClientes();
            }, 800);
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'Error al registrar.';
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'No se pudo conectar con el servidor.';
    }
}

/**
 * Abre el modal para confirmar la baja lógica de un cliente activo
 */
function openAnularClienteModal(nro_cliente, nombreCompleto) {
    const bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <p>¿Está seguro que desea dar de baja (inactivar) al cliente?</p>
            <p><strong>Cliente:</strong> ${nombreCompleto} (#${nro_cliente})</p>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">Nota: El cliente pasará a estar inactivo.</p>
            <div id="modal-confirm-feedback" class="feedback-msg"></div>
        </div>
    `;
    const footerHtml = `
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn-danger" onclick="confirmarBaja(${nro_cliente})">Confirmar Baja</button>
    `;
    openModal('Confirmar Baja de Cliente', bodyHtml, footerHtml);
}

/**
 * Envía la solicitud DELETE para pasar al cliente a inactivo
 */
async function confirmarBaja(nro_cliente) {
    const feedback = document.getElementById('modal-confirm-feedback');
    feedback.className = 'feedback-msg';
    feedback.style.display = 'block';
    feedback.textContent = 'Procesando...';

    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${nro_cliente}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) {
            feedback.className = 'feedback-msg success';
            feedback.textContent = 'Cliente dado de baja con éxito.';
            showToast('Cliente dado de baja con éxito.');
            setTimeout(() => {
                closeModal();
                cargarClientes();
            }, 800);
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'Error al procesar la baja.';
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'No se pudo conectar con el servidor.';
    }
}

/**
 * Abre el modal para confirmar la reactivación de un cliente inactivo
 */
function openActivarClienteModal(nro_cliente, nombreCompleto) {
    const bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <p>¿Desea reactivar (pasar a activo) al siguiente cliente?</p>
            <p><strong>Cliente:</strong> ${nombreCompleto} (#${nro_cliente})</p>
            <div id="modal-confirm-feedback" class="feedback-msg"></div>
        </div>
    `;
    const footerHtml = `
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn-action activar" style="color:#fff;" onclick="confirmarActivacion(${nro_cliente})">Confirmar Activación</button>
    `;
    openModal('Confirmar Activación', bodyHtml, footerHtml);
}

/**
 * Realiza la reactivación enviando los datos del cliente al endpoint PUT
 */
async function confirmarActivacion(nro_cliente) {
    const feedback = document.getElementById('modal-confirm-feedback');
    feedback.className = 'feedback-msg';
    feedback.style.display = 'block';
    feedback.textContent = 'Procesando...';

    try {
        // Obtener datos actuales del cliente para la firma del stored procedure en PUT
        const getRes = await fetch(`${API_BASE_URL}/clientes/${nro_cliente}`);
        const getResult = await getRes.json();
        if (!getRes.ok) {
            feedback.className = 'feedback-msg error';
            feedback.textContent = getResult.message || 'Error al recuperar los datos del cliente.';
            return;
        }

        const c = getResult.data;
        const payload = {
            nombre: c.nombre,
            apellido: c.apellido,
            direccion: c.direccion,
            activo: 1
        };

        const response = await fetch(`${API_BASE_URL}/clientes/${nro_cliente}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
            feedback.className = 'feedback-msg success';
            feedback.textContent = 'Cliente reactivado con éxito.';
            showToast('Cliente reactivado con éxito.');
            setTimeout(() => {
                closeModal();
                cargarClientes();
            }, 800);
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'Error al reactivar.';
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'No se pudo conectar con el servidor.';
    }
}

/**
 * Renders the Productos view with forms for Alta and Modificar
 */
function renderProductosView(container) {
    container.innerHTML = `
        <div class="form-grid">
            <div class="form-section">
                <h3>Alta o Modificación de Producto</h3>
                <p class="section-desc">Registra un nuevo producto en el catálogo o actualiza los datos de uno existente.</p>
                
                <form id="producto-form" onsubmit="handleProductoSubmit(event)">
                    <div class="form-group">
                        <label for="p_accion">Acción</label>
                        <select id="p_accion" required onchange="toggleProductFields(this.value)">
                            <option value="ALTA">Alta (Registrar Nuevo)</option>
                            <option value="MODIFICAR">Modificar (Actualizar Datos)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="p_codigo">Código de Producto</label>
                        <div class="input-with-button">
                            <input type="number" id="p_codigo" required placeholder="Ej. 501">
                            <button type="button" id="p_buscar_btn" class="btn-secondary" onclick="buscarProducto()">Buscar</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="p_marca">Marca</label>
                        <input type="text" id="p_marca" required placeholder="Ej. IPSUM">
                    </div>

                    <div class="form-group">
                        <label for="p_nombre">Nombre del Producto</label>
                        <input type="text" id="p_nombre" required placeholder="Ej. Teclado Mecánico">
                    </div>

                    <div class="form-group">
                        <label for="p_descripcion">Descripción</label>
                        <input type="text" id="p_descripcion" required placeholder="Ej. Teclado RGB switch blue">
                    </div>

                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="p_precio">Precio (Sin IVA)</label>
                            <input type="number" step="0.01" id="p_precio" required placeholder="0.00">
                        </div>

                        <div class="form-group">
                            <label for="p_stock">Stock Inicial</label>
                            <input type="number" id="p_stock" required placeholder="0">
                        </div>
                    </div>

                    <button type="submit" class="btn-primary" id="p_submit_btn">Guardar Producto</button>
                </form>
                <div id="producto-feedback" class="feedback-msg"></div>
            </div>
        </div>
    `;
}

/**
 * Muestra/oculta campos según la acción en Productos
 */
function toggleProductFields(accion) {
    const buscarBtn = document.getElementById('p_buscar_btn');
    const fields = ['p_marca', 'p_nombre', 'p_descripcion', 'p_precio', 'p_stock'];
    const submitBtn = document.getElementById('p_submit_btn');
    const feedback = document.getElementById('producto-feedback');

    feedback.style.display = 'none';

    if (accion === 'MODIFICAR') {
        buscarBtn.style.display = 'block';
        submitBtn.disabled = true;

        // Bloquear campos hasta buscar
        fields.forEach(fId => {
            document.getElementById(fId).disabled = true;
        });
    } else {
        buscarBtn.style.display = 'none';
        submitBtn.disabled = false;

        // Desbloquear y limpiar campos
        fields.forEach(fId => {
            const field = document.getElementById(fId);
            field.disabled = false;
            field.value = '';
        });
        document.getElementById('p_codigo').disabled = false;
    }
}

/**
 * Busca un producto por código en la base de datos para precargar y validar sus datos al Modificar
 */
async function buscarProducto() {
    const codigo_producto = document.getElementById('p_codigo').value;
    const feedback = document.getElementById('producto-feedback');
    const fields = ['p_marca', 'p_nombre', 'p_descripcion', 'p_precio', 'p_stock'];
    const submitBtn = document.getElementById('p_submit_btn');

    if (!codigo_producto) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'Por favor ingresa un código de producto para buscar.';
        return;
    }

    feedback.className = 'feedback-msg';
    feedback.style.display = 'block';
    feedback.textContent = 'Buscando producto...';

    try {
        const response = await fetch(`${API_BASE_URL}/productos/${codigo_producto}`);
        const result = await response.json();

        if (response.ok) {
            const producto = result.data;
            document.getElementById('p_marca').value = producto.marca;
            document.getElementById('p_nombre').value = producto.nombre;
            document.getElementById('p_descripcion').value = producto.descripcion;
            document.getElementById('p_precio').value = producto.precio;
            document.getElementById('p_stock').value = producto.stock;

            // Desbloquear campos para edición
            fields.forEach(fId => {
                document.getElementById(fId).disabled = false;
            });
            // Bloquear el ID para que no lo cambien después de buscar
            document.getElementById('p_codigo').disabled = true;
            submitBtn.disabled = false;

            feedback.className = 'feedback-msg success';
            feedback.textContent = 'Producto encontrado. Puedes editar sus campos ahora.';
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'El producto no existe.';

            // Bloquear y limpiar
            fields.forEach(fId => {
                document.getElementById(fId).disabled = true;
                document.getElementById(fId).value = '';
            });
            submitBtn.disabled = true;
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'Error al conectar con el backend.';
    }
}

/**
 * Envia petición POST o PUT al backend de Flask para Productos
 */
async function handleProductoSubmit(event) {
    event.preventDefault();
    const feedback = document.getElementById('producto-feedback');
    feedback.className = 'feedback-msg';
    feedback.textContent = 'Procesando...';

    const accion = document.getElementById('p_accion').value;
    const codigo_producto = document.getElementById('p_codigo').value;
    const marca = document.getElementById('p_marca').value;
    const nombre = document.getElementById('p_nombre').value;
    const descripcion = document.getElementById('p_descripcion').value;
    const precio = document.getElementById('p_precio').value;
    const stock = document.getElementById('p_stock').value;

    const payload = {
        codigo_producto: parseInt(codigo_producto),
        marca: marca,
        nombre: nombre,
        descripcion: descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock)
    };

    try {
        let response;
        if (accion === 'ALTA') {
            response = await fetch(`${API_BASE_URL}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/productos/${codigo_producto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();

        if (response.ok) {
            feedback.className = 'feedback-msg success';
            feedback.textContent = result.message;
            showToast(result.message);

            // Resetear el formulario al guardar
            document.getElementById('producto-form').reset();
            toggleProductFields(accion);
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'Error en el servidor.';
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'No se pudo conectar con el servidor backend.';
    }
}

/**
 * Renders the Inventario view, fetching products and styling stock
 */
async function renderInventarioView(container) {
    container.innerHTML = `
        <div class="search-bar-container">
            <input type="text" id="inventario-search" placeholder="Buscar por código, nombre o marca..." oninput="filtrarInventario(this.value)">
        </div>
        <div class="table-container">
            <table class="flat-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Marca</th>
                        <th>Descripción</th>
                        <th>Precio (Sin IVA)</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody id="inventario-tbody">
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-secondary);">Cargando inventario...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Cargar los productos inicialmente
    cargarProductosTablas('');
}

/**
 * Realiza la petición fetch al backend y dibuja las filas
 */
async function cargarProductosTablas(searchQuery = '') {
    const tbody = document.getElementById('inventario-tbody');
    if (!tbody) return;

    try {
        const url = searchQuery
            ? `${API_BASE_URL}/productos?search=${encodeURIComponent(searchQuery)}`
            : `${API_BASE_URL}/productos`;

        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
            const productos = result.data;
            if (productos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-secondary);">No se encontraron productos.</td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = productos.map(p => {
                let badgeClass = 'normal';
                let badgeText = `${p.stock} unidades`;

                if (p.stock === 0) {
                    badgeClass = 'empty';
                    badgeText = 'Sin Stock';
                } else if (p.stock <= 5) {
                    badgeClass = 'low';
                    badgeText = `${p.stock} (Bajo stock)`;
                }

                return `
                    <tr>
                        <td><strong>${p.codigo_producto}</strong></td>
                        <td>${p.nombre}</td>
                        <td>${p.marca}</td>
                        <td>${p.descripcion}</td>
                        <td>$${parseFloat(p.precio).toFixed(2)}</td>
                        <td><span class="stock-badge ${badgeClass}">${badgeText}</span></td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #b91c1c;">Error al cargar datos: ${result.message}</td>
                </tr>
            `;
        }
    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #b91c1c;">No se pudo conectar con el servidor backend.</td>
            </tr>
        `;
    }
}

/**
 * Función que se ejecuta con retraso al escribir en la barra de búsqueda para no saturar al servidor
 */
let searchTimeout;
function filtrarInventario(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        cargarProductosTablas(value);
    }, 200); // 200ms debounce
}

// ==============================================================================
// Módulo: Facturar (MongoDB)
// ==============================================================================

let factura_items = [];

/**
 * Renderiza la vista de emisión de facturas
 */
function renderFacturarView(container) {
    factura_items = [];

    container.innerHTML = `
        <div class="form-grid2">
            <!-- Formulario de Emisión -->
            <div class="form-section">
                <h3>Emitir Factura</h3>
                <p class="section-desc">Completa los datos de la factura. El IVA (21%) se calcula automáticamente. Los datos se almacenan en MongoDB.</p>

                <form id="factura-form" onsubmit="handleEmitirFactura(event)">
                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="f_nro_factura">Nro. Factura</label>
                            <input type="number" id="f_nro_factura" required placeholder="Ej. 7001">
                        </div>
                        <div class="form-group">
                            <label for="f_nro_cliente">Nro. Cliente</label>
                            <input type="number" id="f_nro_cliente" required placeholder="Ej. 1045">
                        </div>
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--border-color); margin: 20px 0;">

                    <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 12px;">Ítems de la factura</h4>

                    <div id="items-container"></div>

                    <div class="form-group-row" style="margin-top: 12px;">
                        <div class="form-group">
                            <label for="f_item_codigo">Código Producto</label>
                            <input type="number" id="f_item_codigo" placeholder="Ej. 501">
                        </div>
                        <div class="form-group">
                            <label for="f_item_cantidad">Cantidad</label>
                            <input type="number" id="f_item_cantidad" placeholder="Ej. 2">
                        </div>
                    </div>
                    <button type="button" class="btn-secondary" onclick="agregarItem()">+ Agregar Ítem</button>

                    <hr style="border: none; border-top: 1px solid var(--border-color); margin: 20px 0;">

                    <button type="submit" class="btn-primary" id="f_submit_btn">Emitir Factura</button>
                </form>
                <div id="factura-feedback" class="feedback-msg"></div>
            </div>

            <!-- Últimas Facturas -->
            <div class="form-section" style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h3 style="margin: 0;">Últimas Facturas Emitidas</h3>
                    <select id="facturas-sort" onchange="renderFacturasList()" style="padding: 6px; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--border-color); outline: none;">
                        <option value="fecha_desc">Más recientes</option>
                        <option value="fecha_asc">Más antiguas</option>
                        <option value="nro_factura_desc">Factura (Mayor a menor)</option>
                        <option value="nro_factura_asc">Factura (Menor a mayor)</option>
                        <option value="nro_cliente_asc">Cliente (Menor a mayor)</option>
                    </select>
                </div>
                <p class="section-desc">Listado de las facturas almacenadas en MongoDB.</p>
                <div id="facturas-lista" style="font-size: 0.9rem; color: var(--text-secondary); flex-grow: 1;">Cargando...</div>
            </div>
        </div>
    `;

    renderItemsTable();
    cargarUltimasFacturas();
}

/**
 * Agrega un ítem a la lista temporal de la factura
 */
function agregarItem() {
    const codigoInput = document.getElementById('f_item_codigo');
    const cantidadInput = document.getElementById('f_item_cantidad');
    const codigo = codigoInput.value;
    const cantidad = cantidadInput.value;

    if (!codigo || !cantidad || parseInt(cantidad) <= 0) {
        const feedback = document.getElementById('factura-feedback');
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'Completa el código de producto y una cantidad válida.';
        return;
    }

    factura_items.push({
        codigo_producto: parseInt(codigo),
        cantidad: parseInt(cantidad)
    });

    codigoInput.value = '';
    cantidadInput.value = '';

    // Limpiar feedback
    const feedback = document.getElementById('factura-feedback');
    feedback.style.display = 'none';

    renderItemsTable();
}

/**
 * Quita un ítem de la lista temporal
 */
function quitarItem(index) {
    factura_items.splice(index, 1);
    renderItemsTable();
}

/**
 * Dibuja la tabla de ítems agregados
 */
function renderItemsTable() {
    const container = document.getElementById('items-container');

    if (factura_items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">No hay ítems agregados aún.</p>';
        return;
    }

    let html = `
        <table class="flat-table" style="margin-bottom: 12px;">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Cód. Producto</th>
                    <th>Cantidad</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;

    factura_items.forEach((item, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${item.codigo_producto}</td>
                <td>${item.cantidad}</td>
                <td><button type="button" class="btn-danger" style="padding: 4px 10px; font-size: 0.75rem;" onclick="quitarItem(${i})">Quitar</button></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Envía la factura al backend para su procesamiento y almacenamiento en MongoDB
 */
async function handleEmitirFactura(event) {
    event.preventDefault();
    const feedback = document.getElementById('factura-feedback');

    if (factura_items.length === 0) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'Agrega al menos un ítem a la factura.';
        return;
    }

    feedback.className = 'feedback-msg';
    feedback.style.display = 'block';
    feedback.textContent = 'Procesando factura...';

    const nro_factura = document.getElementById('f_nro_factura').value;
    const nro_cliente = document.getElementById('f_nro_cliente').value;

    const payload = {
        nro_factura: parseInt(nro_factura),
        nro_cliente: parseInt(nro_cliente),
        items: factura_items
    };

    try {
        const response = await fetch(`${API_BASE_URL}/facturas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            feedback.className = 'feedback-msg success';
            feedback.textContent = result.message;
            showToast(result.message);

            // Resetear formulario e ítems
            document.getElementById('factura-form').reset();
            factura_items = [];
            renderItemsTable();
            cargarUltimasFacturas();
        } else {
            feedback.className = 'feedback-msg error';
            feedback.textContent = result.message || 'Error al emitir la factura.';
        }
    } catch (err) {
        feedback.className = 'feedback-msg error';
        feedback.textContent = 'No se pudo conectar con el servidor backend.';
    }
}

/**
 * Carga las últimas facturas emitidas desde MongoDB para mostrarlas en el panel lateral
 */
async function cargarUltimasFacturas() {
    const container = document.getElementById('facturas-lista');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/facturas`);
        const result = await response.json();

        if (!response.ok || !result.data) {
            container.innerHTML = '<p style="color:#b91c1c;">Error al cargar facturas.</p>';
            return;
        }

        const facturas = result.data;

        if (facturas.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No hay facturas emitidas aún.</p>';
            return;
        }

        window.todasLasFacturas = facturas;
        renderFacturasList();

    } catch (err) {
        container.innerHTML = '<p style="color:#b91c1c;">No se pudo conectar con el backend.</p>';
    }
}

/**
 * Renderiza la lista de facturas aplicando el ordenamiento seleccionado
 */
function renderFacturasList() {
    const container = document.getElementById('facturas-lista');
    if (!container || !window.todasLasFacturas) return;

    if (window.todasLasFacturas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No hay facturas emitidas aún.</p>';
        return;
    }

    const sortOption = document.getElementById('facturas-sort').value;
    let facturas = [...window.todasLasFacturas];

    facturas.sort((a, b) => {
        if (sortOption === 'fecha_desc') {
            return new Date(b.fecha) - new Date(a.fecha) || b.nro_factura - a.nro_factura;
        } else if (sortOption === 'fecha_asc') {
            return new Date(a.fecha) - new Date(b.fecha) || a.nro_factura - b.nro_factura;
        } else if (sortOption === 'nro_factura_desc') {
            return b.nro_factura - a.nro_factura;
        } else if (sortOption === 'nro_factura_asc') {
            return a.nro_factura - b.nro_factura;
        } else if (sortOption === 'nro_cliente_asc') {
            return a.nro_cliente - b.nro_cliente || b.nro_factura - a.nro_factura;
        }
        return 0;
    });

    container.innerHTML = facturas.map((f, index) => {
        const itemsHtml = (Array.isArray(f.items) ? f.items : []).map(i => {
            const cod = i.codigo_producto ?? '—';
            const nom = i.nombre_producto ?? 'SIN NOMBRE';
            const mrc = i.marca ?? 'SIN MARCA';
            const cant = i.cantidad ?? 0;
            const prec = Number(i.precio_unitario ?? 0).toFixed(2);
            const subt = Number(i.subtotal ?? (i.precio_unitario ?? 0) * cant).toFixed(2);
            return `
                <tr>
                    <td><strong>${cod}</strong></td>
                    <td>${nom}</td>
                    <td>${mrc}</td>
                    <td style="text-align: right; white-space: nowrap;">${cant} x $${prec}</td>
                    <td style="text-align: right; font-weight: 600;">$${subt}</td>
                </tr>
            `;
        }).join('');

        const subtotal = Number(f.total_sin_iva || 0);
        const iva = subtotal * 0.21;
        const total = subtotal + iva;

        const subtotalStr = subtotal.toFixed(2);
        const ivaStr = iva.toFixed(2);
        const totalStr = total.toFixed(2);

        return `
            <div class="factura-card">
                <div class="factura-header" onclick="toggleFactura(${index})">
                    <div>
                        <strong>#${f.nro_factura}</strong> | ${f.fecha} | ${f.nombre_cliente || '#' + f.nro_cliente}
                    </div>
                    <div>
                        $${totalStr}
                        <span id="arrow-${index}" class="arrow">▼</span>
                    </div>
                </div>

                <div class="factura-detalle" id="detalle-${index}" style="display:none;">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">Detalle de Ítems:</div>
                    <table class="factura-detalle-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Marca</th>
                                <th style="text-align: right;">Cant. x Unit.</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="factura-resumen">
                        <div class="factura-resumen-row">
                            <span style="color: var(--text-secondary);">Subtotal (sin IVA):</span>
                            <span>$${subtotalStr}</span>
                        </div>
                        <div class="factura-resumen-row">
                            <span style="color: var(--text-secondary);">IVA (21%):</span>
                            <span>$${ivaStr}</span>
                        </div>
                        <div class="factura-resumen-row total">
                            <span>Total:</span>
                            <span>$${totalStr}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/* =========================================
   Notificaciones Toast
   ========================================= */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check_circle' : 'error';

    toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Wait for transition
    }, 3500);
}

function toggleFactura(index) {
    const detalle = document.getElementById(`detalle-${index}`);
    const arrow = document.getElementById(`arrow-${index}`);

    const isOpen = detalle.style.display === 'block';

    if (isOpen) {
        detalle.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        detalle.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    }
}
