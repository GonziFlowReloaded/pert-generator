// Función para exportar como PNG
function setupExportButton() {
    document.getElementById('export-png').addEventListener('click', function() {
        const diagramContainer = document.getElementById('pert-diagram');
        
        // Asegurarse de que el contenedor tenga el tamaño correcto
        const originalWidth = diagramContainer.style.width;
        const originalHeight = diagramContainer.style.height;
        const originalPosition = diagramContainer.style.position;
        
        // Configurar el contenedor para la captura
        diagramContainer.style.position = 'absolute';
        diagramContainer.style.width = diagramContainer.scrollWidth + 'px';
        diagramContainer.style.height = diagramContainer.scrollHeight + 'px';
        
        // Usar html2canvas para capturar el contenido
        html2canvas(diagramContainer, {
            scale: 2, // Aumentar la resolución
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            width: diagramContainer.scrollWidth,
            height: diagramContainer.scrollHeight
        }).then(canvas => {
            // Restaurar el estilo original del contenedor
            diagramContainer.style.width = originalWidth;
            diagramContainer.style.height = originalHeight;
            diagramContainer.style.position = originalPosition;
            
            // Crear un enlace para descargar
            const link = document.createElement('a');
            link.download = 'diagrama-pert.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('Error al exportar el diagrama:', error);
            alert('Hubo un error al exportar el diagrama. Por favor, inténtalo de nuevo.');
            
            // Restaurar el estilo original del contenedor en caso de error
            diagramContainer.style.width = originalWidth;
            diagramContainer.style.height = originalHeight;
            diagramContainer.style.position = originalPosition;
        });
    });
} 