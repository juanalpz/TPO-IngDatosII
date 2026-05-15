import streamlit as st
from st_keyup import st_keyup

# ¡¡ Configuración general !! """
st.set_page_config(
    page_title="Sistema de Facturación",
    # page_icon=""
    layout="wide"
)

# ¡¡ Estilos !! """
st.markdown(
    """
    <style>
        .stApp {
            background-color: #f4f6f9;
        }

        .titulo {
            font-size: 42px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }

        .subtitulo {
            font-size: 20px;
            color: #4b5563;
            margin-bottom: 40px;
        }

        .card {
            background-color: white;
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
    </style>
    """,
    unsafe_allow_html=True
)

# Sidebar !! """
with st.sidebar:
    st.title("Facturación")
    st.markdown("---")

    pagina = st.radio(
        "Navegación",
        [
            "Home",
            "Clientes",
            "Productos",
            "Facturas"
        ]
    )

# Home !!
if pagina == "Home":
    st.markdown(
        '<div class="titulo">Bienvenido al Sistema de Facturación</div>',
        unsafe_allow_html=True
    )
    st.markdown(
        '<div class="subtitulo">Gestioná clientes, productos y facturas desde una única plataforma.</div>',
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(
            """
            <div class="card">
                <h3>Clientes</h3>
                <p>Alta, baja y modificación de clientes.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with col2:
        st.markdown(
            """
            <div class="card">
                <h3>Productos</h3>
                <p>Gestión de productos y stock.</p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with col3:
        st.markdown(
            """
            <div class="card">
                <h3>Facturas</h3>
                <p>Visualización y emisión de facturas.</p>
            </div>
            """,
            unsafe_allow_html=True
        )

# Clientes !!
elif pagina == "Clientes":

    st.title("👤 Clientes")

    # Datos de ejemplo !
    clientes = [
        {
            "nro_cliente": 1,
            "nombre": "Juan",
            "apellido": "Pérez",
            "direccion": "Buenos Aires",
            "activo": "Sí"
        },
        {
            "nro_cliente": 2,
            "nombre": "Ana",
            "apellido": "Gómez",
            "direccion": "Córdoba",
            "activo": "Sí"
        },
        {
            "nro_cliente": 3,
            "nombre": "Carlos",
            "apellido": "López",
            "direccion": "Rosario",
            "activo": "No"
        }
    ]

    # Búsqueda !
    busqueda = st.text_input(
        "🔎 Buscar cliente",
        placeholder="Buscar por número, nombre, apellido o dirección..."
    )

    # Filtro !
    if busqueda:

        clientes_filtrados = []

        for cliente in clientes:

            texto = " ".join(
                str(valor).lower()
                for valor in cliente.values()
            )

            if busqueda.lower() in texto:
                clientes_filtrados.append(cliente)

    else:
        clientes_filtrados = clientes

    # Layout dinámico !
    mostrar_panel = (
        "cliente_ver" in st.session_state or
        "cliente_editar" in st.session_state
    )

    if mostrar_panel:
        tabla_col, detalle_col = st.columns([2.2, 1])
    else:
        tabla_col = st.container()

    # Tabla clientes !
    with tabla_col:

        encabezados = st.columns([1, 2, 2, 3, 1, 2])

        encabezados[0].markdown("**N° Cliente**")
        encabezados[1].markdown("**Nombre**")
        encabezados[2].markdown("**Apellido**")
        encabezados[3].markdown("**Dirección**")
        encabezados[4].markdown("**Activo**")
        encabezados[5].markdown("**Acciones**")

        st.markdown("---")

        for cliente in clientes_filtrados:

            cols = st.columns([1, 2, 2, 3, 1, 2])

            cols[0].write(cliente["nro_cliente"])
            cols[1].write(cliente["nombre"])
            cols[2].write(cliente["apellido"])
            cols[3].write(cliente["direccion"])
            cols[4].write(cliente["activo"])

            with cols[5]:

                accion1, accion2, accion3 = st.columns(3)

                # VER
                with accion1:

                    if st.button(
                        "🔍",
                        key=f"ver_{cliente['nro_cliente']}"
                    ):

                        st.session_state["cliente_ver"] = cliente

                        if "cliente_editar" in st.session_state:
                            del st.session_state["cliente_editar"]

                        st.rerun()

                # EDITAR
                with accion2:

                    if st.button(
                        "✏️",
                        key=f"editar_{cliente['nro_cliente']}"
                    ):

                        st.session_state["cliente_editar"] = cliente

                        if "cliente_ver" in st.session_state:
                            del st.session_state["cliente_ver"]

                        st.rerun()

                # ANULAR
                with accion3:

                    if st.button(
                        "🚫",
                        key=f"anular_{cliente['nro_cliente']}"
                    ):

                        st.session_state["cliente_anular"] = cliente

                        st.rerun()

            st.markdown("---")

    # Panel derecho !
    if mostrar_panel:

        with detalle_col:

            # Editar cliente !
            if "cliente_editar" in st.session_state:

                cliente = st.session_state["cliente_editar"]

                st.markdown("## ✏️ Editar Cliente")

                nombre = st.text_input(
                    "Nombre",
                    value=cliente["nombre"]
                )

                apellido = st.text_input(
                    "Apellido",
                    value=cliente["apellido"]
                )

                direccion = st.text_input(
                    "Dirección",
                    value=cliente["direccion"]
                )

                activo = st.selectbox(
                    "Activo",
                    ["Sí", "No"],
                    index=0 if cliente["activo"] == "Sí" else 1
                )

                st.markdown("### 📍 Ubicación")

                st.components.v1.html(
                    f'''
                    <iframe
                        width="100%"
                        height="250"
                        style="border:0;border-radius:12px"
                        loading="lazy"
                        allowfullscreen
                        src="https://maps.google.com/maps?q={direccion.replace(' ', '+')}&output=embed">
                    </iframe>
                    ''',
                    height=260
                )

                col1, col2 = st.columns(2)

                with col1:

                    if st.button("💾 Guardar"):

                        st.success("Cambios guardados")

                with col2:

                    if st.button("Cerrar edición"):

                        del st.session_state["cliente_editar"]

                        st.rerun()

            # Ver cliente !
            elif "cliente_ver" in st.session_state:

                cliente = st.session_state["cliente_ver"]

                st.markdown("## 👁️ Detalle Cliente")

                st.text_input(
                    "Nombre",
                    value=cliente["nombre"],
                    disabled=True
                )

                st.text_input(
                    "Apellido",
                    value=cliente["apellido"],
                    disabled=True
                )

                st.text_input(
                    "Dirección",
                    value=cliente["direccion"],
                    disabled=True
                )

                st.text_input(
                    "Activo",
                    value=cliente["activo"],
                    disabled=True
                )

                st.markdown("### 📍 Ubicación")

                st.components.v1.html(
                    f'''
                    <iframe
                        width="100%"
                        height="250"
                        style="border:0;border-radius:12px"
                        loading="lazy"
                        allowfullscreen
                        src="https://maps.google.com/maps?q={cliente['direccion'].replace(' ', '+')}&output=embed">
                    </iframe>
                    ''',
                    height=260
                )

                if st.button("Cerrar detalle"):

                    del st.session_state["cliente_ver"]

                    st.rerun()


# Anular cliente !!
@st.dialog("Confirmar baja")
def modal_anular(cliente):

    st.warning(
        f"¿Seguro que querés dar de baja a {cliente['nombre']} {cliente['apellido']}?"
    )

    col1, col2 = st.columns(2)

    with col1:

        if st.button("🚫 Confirmar baja"):

            st.success("Cliente dado de baja")

            del st.session_state["cliente_anular"]

            st.rerun()

    with col2:

        if st.button("Cancelar"):

            del st.session_state["cliente_anular"]

            st.rerun()


# Abrir opción de anular cliente
if "cliente_anular" in st.session_state:

    modal_anular(
        st.session_state["cliente_anular"]
    )