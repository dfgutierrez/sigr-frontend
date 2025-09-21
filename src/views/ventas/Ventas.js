import React, { useState, useEffect } from "react";
import { ventaService } from "api/ventaService.js";
import { sedeService } from "api/sedeService.js";
import VentaForm from "components/Forms/VentaForm.js";
import ConfirmationModal from "components/Modals/ConfirmationModal.js";
import { useToast } from "hooks/useToast.js";
import { useAuth } from "contexts/AuthContext.js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ventaToCancel, setVentaToCancel] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [ventaToDeliver, setVentaToDeliver] = useState(null);
  const [expandedVenta, setExpandedVenta] = useState(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState({});
  // Función para obtener el primer día del mes actual
  const getPrimerDiaDelMes = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01T00:00:00`;
  };

  // Función para obtener el último día del mes actual
  const getUltimoDiaDelMes = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(lastDay).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}T23:59:59`;
  };

  const [filters, setFilters] = useState(() => {
    const fechaInicio = getPrimerDiaDelMes();
    const fechaFin = getUltimoDiaDelMes();
    
    console.log('🎯 INICIALIZACIÓN: Filtros por defecto:', {
      fechaInicio,
      fechaFin
    });
    
    return {
      fechaInicio,
      fechaFin
    };
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchVentas = async () => {
    console.log('🚀 FETCH VENTAS EJECUTÁNDOSE...');
    console.log('🚀 Filtros actuales:', filters);
    
    try {
      setLoading(true);
      
      // Obtener el sedeId del usuario autenticado con debugging extensivo
      console.log('👤 DEBUGGING USER OBJECT:');
      console.log('👤 Usuario completo:', JSON.stringify(user, null, 2));
      console.log('👤 Propiedades del user:', Object.keys(user || {}));
      
      const userSedeId = getUserSedeId(user);
      console.log('🏢 SedeId final encontrado:', userSedeId);
      
      if (!userSedeId) {
        console.warn("No se encontró sedeId para el usuario autenticado");
        showToast("Error: No se puede determinar la sede del usuario", "error");
        setLoading(false);
        return;
      }
      
      // IMPORTANTE: Usar SIEMPRE la sede del usuario logueado
      const sedeIdToUse = userSedeId;
      
      // Preparar fechas en formato ISO si están presentes
      let fechaDesde = null;
      let fechaHasta = null;
      
      if (filters.fechaInicio) {
        fechaDesde = filters.fechaInicio;
      }
      
      if (filters.fechaFin) {
        fechaHasta = filters.fechaFin;
      }
      
      console.log('🔍 Consultando ventas con:', {
        sedeId: sedeIdToUse,
        fechaDesde,
        fechaHasta,
        page: currentPage,
        size: pageSize
      });
      
      console.log('🌐 URL que se va a consumir:', 
        `/api/v1/ventas/sede/${sedeIdToUse}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&page=${currentPage}&size=${pageSize}`
      );
      
      console.log('⚡ ANTES DE LLAMAR AL SERVICIO - ventaService.obtenerTodasLasVentas...');
      
      // Usar el endpoint unificado de sede con filtros opcionales
      const response = await ventaService.obtenerTodasLasVentas(
        currentPage, 
        pageSize, 
        sedeIdToUse, 
        fechaDesde, 
        fechaHasta
      );
      
      console.log('✅ DESPUÉS DE LLAMAR AL SERVICIO - Response from API:', response);
      
      // Manejar la estructura de respuesta anidada: response.data.content
      let ventasData, totalPagesData;
      
      if (response?.data?.content) {
        // Estructura: { success: true, data: { content: [...], totalPages: N } }
        ventasData = response.data.content;
        totalPagesData = response.data.totalPages;
      } else if (response?.content) {
        // Estructura directa: { content: [...], totalPages: N }
        ventasData = response.content;
        totalPagesData = response.totalPages;
      } else if (Array.isArray(response?.data)) {
        // Estructura: { data: [...] }
        ventasData = response.data;
        totalPagesData = 1;
      } else if (Array.isArray(response)) {
        // Array directo
        ventasData = response;
        totalPagesData = 1;
      } else {
        ventasData = [];
        totalPagesData = 1;
      }
      
      console.log('✅ Processed ventas data:', ventasData);
      console.log('📄 Total pages:', totalPagesData);
      
      setVentas(Array.isArray(ventasData) ? ventasData : []);
      setTotalPages(totalPagesData || 1);
    } catch (error) {
      console.error("Error fetching ventas:", error);
      setVentas([]); // Asegurar que ventas sea un array vacío en caso de error
      setTotalPages(1);
      showToast("Error al cargar las ventas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSedes = async () => {
    try {
      const data = await sedeService.getAllSedes();
      setSedes(data);
    } catch (error) {
      console.error("Error fetching sedes:", error);
    }
  };

  // useEffect para ejecutar al montar el componente (cuando se accede a HISTORIAL DE VENTAS)
  useEffect(() => {
    console.log('🏠 COMPONENTE MONTADO - Inicializando Historial de Ventas...');
    console.log('🏠 Estado inicial del usuario:', user);
    
    // Si ya tenemos usuario, ejecutar inmediatamente
    if (user) {
      console.log('🏠 Usuario disponible al montar, ejecutando fetchVentas...');
      fetchVentas();
      fetchSedes();
    }
  }, []); // Solo se ejecuta al montar

  useEffect(() => {
    console.log('🎯 useEffect EJECUTÁNDOSE - Condiciones:', { 
      hasUser: !!user, 
      currentPage, 
      filters,
      userSedeId: user?.sedeId || user?.sede?.id
    });
    
    if (user) {
      console.log('✅ Usuario encontrado, ejecutando fetchVentas y fetchSedes...');
      fetchVentas();
      fetchSedes();
    } else {
      console.log('❌ No hay usuario, saltando fetchVentas...');
    }
  }, [currentPage, filters, user]);

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleCancel = (venta) => {
    setVentaToCancel(venta);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await ventaService.anularVenta(ventaToCancel.id);
      showToast("Venta anulada exitosamente", "success");
      setShowCancelModal(false);
      setVentaToCancel(null);
      fetchVentas();
    } catch (error) {
      console.error("Error cancelling sale:", error);
      showToast(
        error.response?.data?.message || "Error al anular la venta",
        "error"
      );
    }
  };

  const handleDeliver = (venta) => {
    setVentaToDeliver(venta);
    setShowDeliveryModal(true);
  };

  const confirmDelivery = async () => {
    try {
      await ventaService.marcarVentaComoEntregada(ventaToDeliver.id);
      showToast("Venta marcada como entregada exitosamente", "success");
      setShowDeliveryModal(false);
      setVentaToDeliver(null);
      fetchVentas();
    } catch (error) {
      console.error("Error marking sale as delivered:", error);
      showToast(
        error.response?.data?.message || "Error al marcar la venta como entregada",
        "error"
      );
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    fetchVentas();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      fechaInicio: getPrimerDiaDelMes(),
      fechaFin: getUltimoDiaDelMes()
    });
    setCurrentPage(0);
  };

  const setFiltroRapido = (tipo) => {
    const now = new Date();
    let fechaInicio, fechaFin;

    switch (tipo) {
      case 'hoy':
        const today = now.toISOString().split('T')[0];
        fechaInicio = `${today}T00:00:00`;
        fechaFin = `${today}T23:59:59`;
        break;
      case 'semana':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        fechaInicio = startOfWeek.toISOString().split('T')[0] + 'T00:00:00';
        fechaFin = endOfWeek.toISOString().split('T')[0] + 'T23:59:59';
        break;
      case 'mes':
        fechaInicio = getPrimerDiaDelMes();
        fechaFin = getUltimoDiaDelMes();
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      fechaInicio,
      fechaFin
    }));
    setCurrentPage(0);
  };

  // Función para obtener sedeId del usuario con múltiples intentos
  const getUserSedeId = (user) => {
    if (!user) return null;
    
    // Estructura específica de la respuesta de login: user.sedes[0].id
    if (user.sedes && Array.isArray(user.sedes) && user.sedes.length > 0) {
      return user.sedes[0].id;
    }
    
    // Otras posibles ubicaciones del sedeId
    let sedeId = user?.sedeId || user?.sede?.id || user?.sedeID || user?.Sede?.id;
    
    // Si aún no se encuentra, buscar en todas las propiedades
    if (!sedeId) {
      for (const key in user) {
        if (key.toLowerCase().includes('sede') && user[key]) {
          const sedeValue = user[key];
          // Si es un objeto, intentar extraer el id
          if (typeof sedeValue === 'object' && sedeValue?.id) {
            sedeId = sedeValue.id;
          } else if (typeof sedeValue === 'number' || typeof sedeValue === 'string') {
            sedeId = sedeValue;
          }
          break;
        }
      }
    }
    
    // Asegurar que siempre devuelve un número o string, nunca un objeto
    return sedeId;
  };

  // Función de prueba para verificar el endpoint
  const testearEndpoint = async () => {
    console.log('🧪 PRUEBA MANUAL DEL ENDPOINT');
    const userSedeId = getUserSedeId(user);
    
    console.log('🧪 Usuario completo:', user);
    console.log('🧪 SedeId del usuario logueado:', userSedeId);
    console.log('🧪 Filtros actuales:', filters);
    
    if (userSedeId) {
      try {
        console.log('🧪 EJECUTANDO SERVICIO CON SEDE DEL USUARIO LOGUEADO...');
        console.log(`🧪 URL que se consumirá: /api/v1/ventas/sede/${userSedeId}?fechaDesde=${filters.fechaInicio}&fechaHasta=${filters.fechaFin}&page=0&size=10`);
        
        const result = await ventaService.obtenerTodasLasVentas(
          0, 
          10, 
          userSedeId,  // SIEMPRE usar la sede del usuario logueado
          filters.fechaInicio, 
          filters.fechaFin
        );
        console.log('🧪 RESULTADO DE PRUEBA:', result);
        showToast(`Prueba completada - Sede ${userSedeId} - revisar consola`, 'success');
      } catch (error) {
        console.error('🧪 ERROR DE PRUEBA:', error);
        showToast('Error en prueba - revisar consola', 'error');
      }
    } else {
      console.error('🧪 NO SE ENCONTRÓ SEDE ID EN EL USUARIO');
      console.error('🧪 Estructura del usuario:', JSON.stringify(user, null, 2));
      showToast('Error: No se encontró sedeId del usuario logueado', 'error');
    }
  };

  const toggleExpandVenta = (ventaId) => {
    setExpandedVenta(expandedVenta === ventaId ? null : ventaId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES") + " " + date.toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getEstadoColor = (estado) => {
    return estado 
      ? "text-green-800 bg-green-200" 
      : "text-red-800 bg-red-200";
  };

  const getEstadoText = (estado) => {
    return estado ? "Activa" : "Anulada";
  };

  const getEstadoEntregaColor = (fechaEntrega) => {
    return fechaEntrega 
      ? "text-green-800 bg-green-200" 
      : "text-orange-800 bg-orange-200";
  };

  const getEstadoEntregaText = (fechaEntrega) => {
    return fechaEntrega ? "Entregada" : "Pendiente";
  };

  const formatDateDelivery = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES") + " " + date.toLocaleTimeString("es-ES", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Función para descargar historial de ventas en Excel (.xlsx)
  const downloadVentasExcel = async () => {
    try {
      setDownloadingExcel(true);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!Array.isArray(ventas) || ventas.length === 0) {
        showToast('No hay ventas para descargar', 'warning');
        setDownloadingExcel(false);
        return;
      }

      // Preparar los datos para Excel
      const excelData = ventas.map(venta => {
        const detalleProductos = venta.detalles?.map(d => d.productoNombre || d.producto?.nombre).join(', ') || 'N/A';
        
        return {
          'ID': venta.id,
          'Fecha': formatDate(venta.fecha),
          'Usuario': venta.usuarioNombre || venta.usuario?.nombreCompleto || 'N/A',
          'Sede': venta.sedeNombre || venta.sede?.nombre || 'N/A',
          'Total': venta.total,
          'Estado': getEstadoText(venta.estado),
          'Estado Entrega': getEstadoEntregaText(venta.fechaEntrega),
          'Fecha Entrega': venta.fechaEntrega ? formatDateDelivery(venta.fechaEntrega) : 'N/A',
          'Productos': detalleProductos
        };
      });

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      
      // Nombre del archivo con fecha
      const fechaActual = new Date().toISOString().split('T')[0];
      const sedeNombre = sedes.find(s => s.id === getUserSedeId(user))?.nombre || 'sede';
      const fileName = `historial_ventas_${sedeNombre}_${fechaActual}.xlsx`;
      
      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Historial Ventas');
      
      // Descargar archivo
      XLSX.writeFile(wb, fileName);
      
      showToast(`Archivo ${fileName} descargado exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error downloading Excel ventas:', error);
      showToast('Error al descargar el historial Excel', 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Función para descargar historial de ventas en CSV
  const downloadVentasCSV = async () => {
    try {
      setDownloadingCSV(true);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!Array.isArray(ventas) || ventas.length === 0) {
        showToast('No hay ventas para descargar', 'warning');
        setDownloadingCSV(false);
        return;
      }

      // Preparar los datos para CSV
      const csvData = ventas.map(venta => {
        const detalleProductos = venta.detalles?.map(d => d.productoNombre || d.producto?.nombre).join(', ') || 'N/A';
        
        return {
          'ID': venta.id,
          'Fecha': formatDate(venta.fecha),
          'Usuario': venta.usuarioNombre || venta.usuario?.nombreCompleto || 'N/A',
          'Sede': venta.sedeNombre || venta.sede?.nombre || 'N/A',
          'Total': venta.total,
          'Estado': getEstadoText(venta.estado),
          'Estado Entrega': getEstadoEntregaText(venta.fechaEntrega),
          'Fecha Entrega': venta.fechaEntrega ? formatDateDelivery(venta.fechaEntrega) : 'N/A',
          'Productos': detalleProductos
        };
      });

      // Convertir a CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','), // Header row
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar valores que contengan comas o comillas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Nombre del archivo con fecha
      const fechaActual = new Date().toISOString().split('T')[0];
      const sedeNombre = sedes.find(s => s.id === getUserSedeId(user))?.nombre || 'sede';
      const fileName = `historial_ventas_${sedeNombre}_${fechaActual}.csv`;
      
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Archivo ${fileName} descargado exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error downloading CSV ventas:', error);
      showToast('Error al descargar el historial CSV', 'error');
    } finally {
      setDownloadingCSV(false);
    }
  };

  // Función para generar y descargar PDF de la factura
  const downloadFacturaPDF = async (venta) => {
    try {
      setDownloadingPDF(prev => ({ ...prev, [venta.id]: true }));
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Obtener información completa de la venta desde el servidor
      console.log('🔄 Obteniendo información completa de la venta:', venta.id);
      const ventaCompleta = await ventaService.obtenerVentaPorId(venta.id);
      console.log('✅ Información completa obtenida:', ventaCompleta);
      
      // Usar la información completa (ventaCompleta.data) en lugar de la venta del listado
      const ventaData = ventaCompleta.data || ventaCompleta;
      
      // Crear nuevo documento PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configurar fuente y colores
      pdf.setFont('helvetica');
      
      // Fondo del encabezado
      pdf.setFillColor(240, 248, 255); // Azul muy claro
      pdf.rect(15, 10, pageWidth - 30, 45, 'F');
      
      // Borde del encabezado
      pdf.setDrawColor(70, 130, 180); // Azul acero
      pdf.setLineWidth(1);
      pdf.rect(15, 10, pageWidth - 30, 45);
      
      // Línea 1: Información de la empresa
      pdf.setFontSize(14);
      pdf.setTextColor(25, 25, 112); // Azul medianoche
      pdf.text('LUIS FERNANDO ROBAYO DIAZ - NIT: 14.224.583-5', pageWidth / 2, 25, { align: 'center' });
      
      // Línea 2: ORDEN DE TRABAJO
      pdf.setFontSize(18);
      pdf.setTextColor(25, 25, 112); // Azul medianoche
      pdf.text('ORDEN DE TRABAJO', pageWidth / 2, 37, { align: 'center' });
      
      // Línea 3: Número en rojo
      pdf.setFontSize(16);
      pdf.setTextColor(220, 20, 60); // Rojo carmesí
      pdf.text(`No. ${ventaData.id}`, pageWidth / 2, 49, { align: 'center' });
      
      // Si la venta está anulada, agregar marca de ANULADA
      if (!ventaData.estado) {
        // Fondo rojo semi-transparente para "ANULADA"
        pdf.setFillColor(255, 0, 0); // Rojo
        pdf.rect(pageWidth / 2 - 40, 52, 80, 15, 'F');
        
        // Texto "ANULADA" en blanco
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255); // Blanco
        pdf.text('ANULADA', pageWidth / 2, 62, { align: 'center' });
      }
      
      // Información general en caja
      let yPosition = !ventaData.estado ? 80 : 70; // Ajustar posición si está anulada
      pdf.setFillColor(250, 250, 250); // Gris muy claro
      pdf.rect(15, yPosition, pageWidth - 30, 30, 'F');
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.rect(15, yPosition, pageWidth - 30, 30);
      
      yPosition += 15;
      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      
      const sedeNombre = ventaData.sedeNombre || ventaData.sede?.nombre || 'Sede no encontrada';
      pdf.text(`Sede: ${sedeNombre}`, 20, yPosition);
      pdf.text(`Fecha: ${formatDate(ventaData.fecha)}`, 20, yPosition + 10);
      pdf.text(`Usuario: ${ventaData.usuarioNombre || ventaData.usuario?.nombreCompleto || 'N/A'}`, pageWidth / 2 + 10, yPosition);
      
      // Información del vehículo (si existe)
      if (ventaData.vehiculo) {
        yPosition += 30;
        
        // Título de la sección con fondo
        pdf.setFillColor(70, 130, 180); // Azul acero
        pdf.rect(15, yPosition, pageWidth - 30, 12, 'F');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Blanco
        pdf.text('INFORMACION DEL VEHICULO', 20, yPosition + 8);
        
        yPosition += 20;
        const vehiculo = ventaData.vehiculo;
        
        // Crear tabla con bordes
        const tableData = [
          [`Placa:`, vehiculo.placa || 'N/A', `Conductor:`, vehiculo.nombreConductor || 'N/A'],
          [`Tipo:`, vehiculo.tipo || 'N/A', `Cedula:`, vehiculo.documento || 'N/A'],
          [`Kilometros:`, vehiculo.km ? vehiculo.km.toLocaleString() + ' km' : 'N/A', `Celular:`, vehiculo.celular || 'N/A'],
          [`Sigla:`, vehiculo.sigla || 'N/A', `Fecha Salida:`, vehiculo.fechaSalida ? formatDate(vehiculo.fechaSalida) : 'N/A'],
          [`Fecha Ingreso:`, vehiculo.fechaIngreso ? formatDate(vehiculo.fechaIngreso) : 'N/A', ``, ``]
        ];
        
        const cellWidth = (pageWidth - 30) / 4;
        const cellHeight = 12;
        
        for (let row = 0; row < tableData.length; row++) {
          for (let col = 0; col < 4; col++) {
            const x = 15 + (col * cellWidth);
            const y = yPosition + (row * cellHeight);
            
            // Alternar colores de fondo
            if (row % 2 === 0) {
              pdf.setFillColor(248, 248, 248);
            } else {
              pdf.setFillColor(255, 255, 255);
            }
            pdf.rect(x, y, cellWidth, cellHeight, 'F');
            
            // Bordes
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.3);
            pdf.rect(x, y, cellWidth, cellHeight);
            
            // Texto
            pdf.setFontSize(9);
            if (col % 2 === 0) {
              pdf.setTextColor(70, 70, 70); // Etiquetas más oscuras
            } else {
              pdf.setTextColor(0, 0, 0); // Valores en negro
            }
            
            if (tableData[row][col]) {
              pdf.text(tableData[row][col], x + 3, y + 8);
            }
          }
        }
        
        yPosition += (tableData.length * cellHeight) + 10;
      } else {
        // Si no hay vehículo, agregar una nota
        yPosition += 20;
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text('No hay vehículo asociado a esta venta', 20, yPosition);
        yPosition += 15;
      }
      
      // Tabla de productos
      yPosition += 10;
      
      // Título de la sección con fondo
      pdf.setFillColor(70, 130, 180); // Azul acero
      pdf.rect(15, yPosition, pageWidth - 30, 12, 'F');
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255); // Blanco
      pdf.text('DETALLE DE PRODUCTOS', 20, yPosition + 8);
      
      yPosition += 20;
      
      // Encabezados de la tabla con fondo
      pdf.setFillColor(240, 240, 240); // Gris claro
      pdf.rect(15, yPosition, pageWidth - 30, 12, 'F');
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.rect(15, yPosition, pageWidth - 30, 12);
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      pdf.text('PRODUCTO', 20, yPosition + 8);
      pdf.text('CANT.', pageWidth - 120, yPosition + 8);
      pdf.text('PRECIO UNIT.', pageWidth - 90, yPosition + 8);
      pdf.text('SUBTOTAL', pageWidth - 40, yPosition + 8);
      
      yPosition += 12;
      
      // Productos
      let total = 0;
      if (ventaData.detalles && Array.isArray(ventaData.detalles)) {
        ventaData.detalles.forEach((detalle, index) => {
          // Verificar si necesitamos una nueva página
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = 30;
            
            // Repetir encabezado de tabla en nueva página
            pdf.setFillColor(240, 240, 240);
            pdf.rect(15, yPosition, pageWidth - 30, 12, 'F');
            pdf.setDrawColor(180, 180, 180);
            pdf.setLineWidth(0.5);
            pdf.rect(15, yPosition, pageWidth - 30, 12);
            
            pdf.setFontSize(10);
            pdf.setTextColor(50, 50, 50);
            pdf.text('PRODUCTO', 20, yPosition + 8);
            pdf.text('CANT.', pageWidth - 120, yPosition + 8);
            pdf.text('PRECIO UNIT.', pageWidth - 90, yPosition + 8);
            pdf.text('SUBTOTAL', pageWidth - 40, yPosition + 8);
            
            yPosition += 12;
          }
          
          const productoNombre = detalle.productoNombre || detalle.producto?.nombre || 'Producto N/A';
          const cantidad = detalle.cantidad || 0;
          const precioUnitario = detalle.precioUnitario || 0;
          const subtotal = detalle.subtotal || (cantidad * precioUnitario);
          
          // Alternar colores de fondo para las filas
          if (index % 2 === 0) {
            pdf.setFillColor(252, 252, 252); // Muy claro
          } else {
            pdf.setFillColor(248, 248, 248); // Ligeramente más oscuro
          }
          pdf.rect(15, yPosition, pageWidth - 30, 12, 'F');
          
          // Bordes laterales
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.3);
          pdf.rect(15, yPosition, pageWidth - 30, 12);
          
          // Truncar nombre del producto si es muy largo
          const nombreTruncado = productoNombre.length > 30 
            ? productoNombre.substring(0, 30) + '...' 
            : productoNombre;
          
          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.text(nombreTruncado, 20, yPosition + 8);
          pdf.text(cantidad.toString(), pageWidth - 115, yPosition + 8);
          pdf.text(formatCurrency(precioUnitario), pageWidth - 85, yPosition + 8);
          
          // Subtotal en negrita simulada
          pdf.setFontSize(10);
          pdf.setTextColor(70, 130, 180); // Azul para destacar
          pdf.text(formatCurrency(subtotal), pageWidth - 35, yPosition + 8);
          
          yPosition += 12;
          total += subtotal;
        });
      }
      
      // Caja del total
      yPosition += 15;
      pdf.setFillColor(70, 130, 180); // Azul acero
      pdf.rect(pageWidth - 120, yPosition, 105, 20, 'F');
      pdf.setDrawColor(50, 90, 140);
      pdf.setLineWidth(1);
      pdf.rect(pageWidth - 120, yPosition, 105, 20);
      
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('TOTAL:', pageWidth - 110, yPosition + 8);
      pdf.setFontSize(16);
      pdf.text(formatCurrency(total), pageWidth - 110, yPosition + 16);
      
      // Información adicional en caja
      yPosition += 35;
      pdf.setFillColor(250, 250, 250);
      pdf.rect(15, yPosition, pageWidth - 30, 20, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(15, yPosition, pageWidth - 30, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(70, 70, 70);
      
      // Verificar si la venta está anulada
      if (!ventaData.estado) {
        pdf.setTextColor(255, 0, 0); // Rojo para anulada
        pdf.text(`VENTA ANULADA`, 20, yPosition + 8);
        pdf.text(`Esta orden de trabajo ha sido anulada`, 20, yPosition + 15);
      } else if (ventaData.fechaEntrega) {
        pdf.text(`Fecha de entrega: ${formatDateDelivery(ventaData.fechaEntrega)}`, 20, yPosition + 8);
        pdf.text(`Estado: Entregada`, 20, yPosition + 15);
      } else {
        pdf.text(`Estado de entrega: Pendiente`, 20, yPosition + 8);
        pdf.text(`Orden lista para procesar`, 20, yPosition + 15);
      }
      
      // Pie de página elegante
      yPosition = pageHeight - 25;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, yPosition - 5, pageWidth, 30, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Orden de trabajo generada automaticamente', pageWidth / 2, yPosition + 5, { align: 'center' });
      pdf.text(`Generada el: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, yPosition + 12, { align: 'center' });
      pdf.text('LUIS FERNANDO ROBAYO DIAZ - Sistema de Gestion', pageWidth / 2, yPosition + 19, { align: 'center' });
      
      // Nombre del archivo
      const fechaActual = new Date().toISOString().split('T')[0];
      const fileName = `orden_trabajo_${ventaData.id}_${fechaActual}.pdf`;
      
      // Descargar el PDF
      pdf.save(fileName);
      
      showToast(`Orden de trabajo ${fileName} descargada exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error generating PDF factura:', error);
      showToast('Error al generar la orden de trabajo PDF', 'error');
    } finally {
      setDownloadingPDF(prev => ({ ...prev, [venta.id]: false }));
    }
  };

  if (showForm) {
    return (
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <VentaForm
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                  <h3 className="font-semibold text-base text-blueGray-700">
                    Historial de Ventas
                  </h3>
                </div>
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className={`font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 mb-1 ease-linear transition-all duration-150 min-w-[140px] ${
                      downloadingExcel 
                        ? 'bg-green-400 text-white cursor-not-allowed opacity-75' 
                        : (!Array.isArray(ventas) || ventas.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
                    }`}
                    style={{
                      backgroundColor: downloadingExcel 
                        ? '#10b981' 
                        : (!Array.isArray(ventas) || ventas.length === 0)
                        ? '#d1d5db'
                        : '#059669',
                      color: downloadingExcel || (Array.isArray(ventas) && ventas.length > 0)
                        ? '#ffffff'
                        : '#6b7280'
                    }}
                    type="button"
                    onClick={downloadVentasExcel}
                    disabled={downloadingExcel || (!Array.isArray(ventas) || ventas.length === 0)}
                    title="Descargar historial en Excel (.xlsx)"
                  >
                    <i className={`${downloadingExcel ? 'fas fa-spinner fa-spin' : 'fas fa-file-excel'} mr-2`}></i>
                    {downloadingExcel ? 'Descargando...' : 'Descargar Excel'}
                  </button>
                  <button
                    className={`font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 mb-1 ease-linear transition-all duration-150 min-w-[140px] ${
                      downloadingCSV 
                        ? 'bg-blue-400 text-white cursor-not-allowed opacity-75' 
                        : (!Array.isArray(ventas) || ventas.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                    }`}
                    style={{
                      backgroundColor: downloadingCSV 
                        ? '#60a5fa' 
                        : (!Array.isArray(ventas) || ventas.length === 0)
                        ? '#d1d5db'
                        : '#3b82f6',
                      color: downloadingCSV || (Array.isArray(ventas) && ventas.length > 0)
                        ? '#ffffff'
                        : '#6b7280'
                    }}
                    type="button"
                    onClick={downloadVentasCSV}
                    disabled={downloadingCSV || (!Array.isArray(ventas) || ventas.length === 0)}
                    title="Descargar historial en CSV"
                  >
                    <i className={`${downloadingCSV ? 'fas fa-spinner fa-spin' : 'fas fa-file-csv'} mr-2`}></i>
                    {downloadingCSV ? 'Descargando...' : 'Descargar CSV'}
                  </button>
                  <button
                    onClick={fetchVentas}
                    className="bg-yellow-500 text-white active:bg-yellow-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 mb-1 ease-linear transition-all duration-150 min-w-[140px]"
                    type="button"
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    Refrescar
                  </button>
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 min-w-[140px]"
                    type="button"
                    onClick={handleCreate}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Nueva Venta
                  </button>
                </div>
              </div>
              

              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-blueGray-600 mb-1">
                    Sede
                  </label>
                  <div className="border-0 px-3 py-2 text-blueGray-700 bg-gray-100 rounded text-sm shadow w-full flex items-center">
                    <i className="fas fa-building mr-2 text-blueGray-400"></i>
                    <span className="font-medium">
                      {sedes.find(s => s.id === getUserSedeId(user))?.nombre || 'Sede del usuario logueado'}
                    </span>
                    <span className="ml-2 text-xs text-blueGray-500">
                      (ID: {getUserSedeId(user) || 'No encontrado'})
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-blueGray-600 mb-1">
                    Fecha Desde
                  </label>
                  <input
                    type="datetime-local"
                    name="fechaInicio"
                    value={filters.fechaInicio}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    title="Fecha y hora de inicio del filtro"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-blueGray-600 mb-1">
                    Fecha Hasta
                  </label>
                  <input
                    type="datetime-local"
                    name="fechaFin"
                    value={filters.fechaFin}
                    onChange={handleFilterChange}
                    className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    title="Fecha y hora de fin del filtro"
                  />
                </div>
              </div>
            </div>

            <div className="block w-full overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-blueGray-400">Cargando ventas...</span>
                </div>
              ) : (
                <table className="items-center w-full bg-transparent border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        ID
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Fecha
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Usuario
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Sede
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Total
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Estado
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Estado Entrega
                      </th>
                      <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(ventas) && ventas.map((venta) => (
                      <React.Fragment key={venta.id}>
                        <tr>
                          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700">
                            <span className="font-bold">#{venta.id}</span>
                          </th>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {formatDate(venta.fecha)}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {venta.usuarioNombre || venta.usuario?.nombreCompleto || "N/A"}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            {venta.sedeNombre || venta.sede?.nombre || "N/A"}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className="font-bold">{formatCurrency(venta.total)}</span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${getEstadoColor(venta.estado)}`}>
                              {getEstadoText(venta.estado)}
                            </span>
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${getEstadoEntregaColor(venta.fechaEntrega)}`}>
                              {getEstadoEntregaText(venta.fechaEntrega)}
                            </span>
                            {venta.fechaEntrega && (
                              <div className="text-xs text-blueGray-400 mt-1">
                                {formatDateDelivery(venta.fechaEntrega)}
                              </div>
                            )}
                          </td>
                          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleExpandVenta(venta.id)}
                                className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-all duration-200"
                                title="Ver detalles"
                              >
                                <i className={`fas ${expandedVenta === venta.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                              </button>
                              
                              {venta.estado && (
                                <button
                                  onClick={() => handleCancel(venta)}
                                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-all duration-200"
                                  title="Anular venta"
                                >
                                  <i className="fas fa-ban"></i>
                                </button>
                              )}
                              
                              {venta.estado && !venta.fechaEntrega && (
                                <button
                                  onClick={() => handleDeliver(venta)}
                                  className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-50 transition-all duration-200"
                                  title="Marcar como entregada"
                                >
                                  <i className="fas fa-truck"></i>
                                </button>
                              )}
                              
                              <button
                                onClick={() => downloadFacturaPDF(venta)}
                                disabled={downloadingPDF[venta.id]}
                                className={`p-2 rounded transition-all duration-200 ${
                                  downloadingPDF[venta.id]
                                    ? 'text-orange-400 bg-orange-50 cursor-not-allowed'
                                    : 'text-orange-500 hover:text-orange-700 hover:bg-orange-50'
                                }`}
                                title="Descargar orden de trabajo PDF"
                              >
                                <i className={`fas ${downloadingPDF[venta.id] ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded details */}
                        {expandedVenta === venta.id && venta.detalles && (
                          <tr>
                            <td colSpan="8" className="border-t-0 px-6 py-4 bg-blueGray-50">
                              <div className="text-sm">
                                <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-bold text-blueGray-700">Detalles de la Venta</h4>
                                  {venta.vehiculo && (
                                    <div className="bg-white px-3 py-2 rounded shadow-sm">
                                      <div className="text-xs text-blueGray-500 uppercase font-bold">Vehículo Asociado</div>
                                      <div className="font-bold text-blueGray-700">{venta.vehiculo.placa}</div>
                                      <div className="text-xs text-blueGray-500">
                                        {venta.vehiculo.tipo} - {venta.vehiculo.nombreConductor || 'Sin conductor'}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <table className="w-full bg-white rounded shadow-sm">
                                  <thead>
                                    <tr className="bg-blueGray-100">
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Producto</th>
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Cantidad</th>
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Precio Unitario</th>
                                      <th className="px-4 py-2 text-left text-xs font-bold text-blueGray-600">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {venta.detalles.map((detalle, index) => (
                                      <tr key={index} className="border-b border-blueGray-100">
                                        <td className="px-4 py-2 text-xs">
                                          <div>
                                            <div className="font-bold">{detalle.productoNombre || detalle.producto?.nombre || "Producto N/A"}</div>
                                            <div className="text-blueGray-500">{detalle.producto?.codigoBarra || ""}</div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-xs">{detalle.cantidad}</td>
                                        <td className="px-4 py-2 text-xs">{formatCurrency(detalle.precioUnitario)}</td>
                                        <td className="px-4 py-2 text-xs font-bold">{formatCurrency(detalle.subtotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
              
              {Array.isArray(ventas) && ventas.length === 0 && !loading && (
                <div className="text-center py-4">
                  <span className="text-blueGray-400">No hay ventas registradas</span>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{currentPage + 1}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Anular Venta"
        message={`¿Está seguro que desea anular la venta #${ventaToCancel?.id}? Esta acción devolverá el stock al inventario.`}
        confirmText="Anular"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmationModal
        isOpen={showDeliveryModal}
        onCancel={() => setShowDeliveryModal(false)}
        onConfirm={confirmDelivery}
        title="Confirmar Entrega"
        message={`¿Confirma que la venta #${ventaToDeliver?.id} ha sido entregada al cliente? Se registrará la fecha y hora actual de entrega.`}
        confirmText="Confirmar Entrega"
        cancelText="Cancelar"
        type="info"
      />
    </>
  );
}