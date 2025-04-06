// Función para procesar los datos del JSON
function processData(data) {
    const activities = [];
    
    // Extraer todas las actividades
    Object.keys(data).forEach(phase => {
        data[phase].forEach(activity => {
            // Calcular tiempo esperado usando la fórmula PERT: (a + 4m + b) / 6
            const expectedTime = (activity.tiempo_optimista + (4 * activity.tiempo_probable) + activity.tiempo_pesimista) / 6;
            // Calcular la varianza: ((b - a) / 6)²
            const variance = Math.pow((activity.tiempo_pesimista - activity.tiempo_optimista) / 6, 2);
            
            activities.push({
                id: activity.actividad,
                phase: phase,
                description: activity.descripcion,
                predecessors: activity.precedente === "-" ? [] : String(activity.precedente).split(',').map(p => parseInt(p.trim())),
                optimisticTime: activity.tiempo_optimista,
                mostLikelyTime: activity.tiempo_probable,
                pessimisticTime: activity.tiempo_pesimista,
                expectedTime: parseFloat(expectedTime.toFixed(2)),
                variance: parseFloat(variance.toFixed(2)),
                earlyStart: 0,
                earlyFinish: 0,
                lateStart: 0,
                lateFinish: 0,
                slack: 0,
                isCritical: false,
                isDummy: activity.precedente === "dummy" // Para identificar actividades ficticias
            });
        });
    });
    
    // Ordenar actividades por ID
    activities.sort((a, b) => a.id - b.id);
    
    // Calcular early start y early finish (forward pass)
    activities.forEach(activity => {
        if (activity.predecessors.length === 0) {
            activity.earlyStart = 0;
        } else {
            activity.earlyStart = Math.max(...activity.predecessors.map(predId => {
                const pred = activities.find(a => a.id === predId);
                return pred ? pred.earlyFinish : 0;
            }));
        }
        activity.earlyFinish = activity.earlyStart + activity.expectedTime;
    });
    
    // Determinar la duración del proyecto
    const projectDuration = Math.max(...activities.map(a => a.earlyFinish));
    
    // Calcular late start y late finish (backward pass)
    for (let i = activities.length - 1; i >= 0; i--) {
        const activity = activities[i];
        
        // Encontrar las actividades que tienen esta como predecesora
        const successors = activities.filter(a => 
            a.predecessors.includes(activity.id)
        );
        
        if (successors.length === 0) {
            // Si no hay sucesores, es una actividad final
            activity.lateFinish = projectDuration;
        } else {
            activity.lateFinish = Math.min(...successors.map(s => s.lateStart));
        }
        
        activity.lateStart = activity.lateFinish - activity.expectedTime;
        activity.slack = activity.lateStart - activity.earlyStart;
        
        // Determinar si está en la ruta crítica (slack = 0)
        activity.isCritical = Math.abs(activity.slack) < 0.01; // Considerar errores de redondeo
    }
    
    return activities;
}

// Función para generar la tabla de actividades
function generateActivityTable(activities) {
    const tableContainer = document.getElementById('activity-table');
    tableContainer.innerHTML = '';
    
    const table = document.createElement('table');
    
    // Cabecera de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
        'ID', 'Fase', 'Descripción', 'Predecesores', 
        'T. Opt.', 'T. Prob.', 'T. Pes.', 'T. Esperado', 'Varianza',
        'ES', 'EF', 'LS', 'LF', 'Holgura', 'Ruta Crítica'
    ];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    
    activities.forEach(activity => {
        const row = document.createElement('tr');
        
        // Aplicar estilo a las filas de la ruta crítica
        if (activity.isCritical) {
            row.style.backgroundColor = '#ffcccc';
        }
        
        const cells = [
            activity.id,
            activity.phase,
            activity.description,
            activity.predecessors.length > 0 ? activity.predecessors.join(', ') : '-',
            activity.optimisticTime,
            activity.mostLikelyTime,
            activity.pessimisticTime,
            activity.expectedTime,
            activity.variance,
            activity.earlyStart.toFixed(2),
            activity.earlyFinish.toFixed(2),
            activity.lateStart.toFixed(2),
            activity.lateFinish.toFixed(2),
            activity.slack.toFixed(2),
            activity.isCritical ? 'Sí' : 'No'
        ];
        
        cells.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

// Función para generar el diagrama PERT
function generatePERTDiagram(activities) {
    const diagramContainer = document.getElementById('pert-diagram');
    diagramContainer.innerHTML = '';
    
    // Crear los nodos
    activities.forEach(activity => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'node';
        nodeDiv.id = `node-${activity.id}`;
        
        if (activity.isCritical) {
            nodeDiv.classList.add('critical-path');
        }
        
        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';
        
        // ID y descripción
        const nodeId = document.createElement('div');
        nodeId.className = 'node-id';
        nodeId.textContent = `Actividad ${activity.id}`;
        
        const description = document.createElement('div');
        description.className = 'node-description';
        description.textContent = activity.description;
        
        // Contenedor de tiempos
        const timeData = document.createElement('div');
        timeData.className = 'time-data';
        
        // Inicio Temprano y Finalización Temprana
        const earlyBox = document.createElement('div');
        earlyBox.className = 'time-box';
        const earlyLabel = document.createElement('span');
        earlyLabel.className = 'time-label';
        earlyLabel.textContent = 'IT:';
        earlyBox.appendChild(earlyLabel);
        earlyBox.appendChild(document.createTextNode(activity.earlyStart.toFixed(1)));
        
        const earlyFinishBox = document.createElement('div');
        earlyFinishBox.className = 'time-box';
        const earlyFinishLabel = document.createElement('span');
        earlyFinishLabel.className = 'time-label';
        earlyFinishLabel.textContent = 'FT:';
        earlyFinishBox.appendChild(earlyFinishLabel);
        earlyFinishBox.appendChild(document.createTextNode(activity.earlyFinish.toFixed(1)));
        
        // Inicio Tardío y Finalización Tardía
        const lateBox = document.createElement('div');
        lateBox.className = 'time-box';
        const lateLabel = document.createElement('span');
        lateLabel.className = 'time-label';
        lateLabel.textContent = 'ITa:';
        lateBox.appendChild(lateLabel);
        lateBox.appendChild(document.createTextNode(activity.lateStart.toFixed(1)));
        
        const lateFinishBox = document.createElement('div');
        lateFinishBox.className = 'time-box';
        const lateFinishLabel = document.createElement('span');
        lateFinishLabel.className = 'time-label';
        lateFinishLabel.textContent = 'FTa:';
        lateFinishBox.appendChild(lateFinishLabel);
        lateFinishBox.appendChild(document.createTextNode(activity.lateFinish.toFixed(1)));
        
        // Holgura
        const slackBox = document.createElement('div');
        slackBox.className = 'time-box';
        const slackLabel = document.createElement('span');
        slackLabel.className = 'time-label';
        slackLabel.textContent = 'H:';
        slackBox.appendChild(slackLabel);
        slackBox.appendChild(document.createTextNode(activity.slack.toFixed(1)));
        
        // Agregar todos los elementos al nodo
        timeData.appendChild(earlyBox);
        timeData.appendChild(earlyFinishBox);
        timeData.appendChild(lateBox);
        timeData.appendChild(lateFinishBox);
        timeData.appendChild(slackBox);
        
        nodeContent.appendChild(nodeId);
        nodeContent.appendChild(description);
        nodeContent.appendChild(timeData);
        
        nodeDiv.appendChild(nodeContent);
        diagramContainer.appendChild(nodeDiv);
    });
    
    // Organizar los nodos de forma horizontal
    let left = 20;
    let levels = {}; // Almacena los niveles basados en las dependencias
    
    // Determinar el nivel de cada actividad
    activities.forEach(activity => {
        let level = 0;
        if (activity.predecessors.length > 0) {
            level = Math.max(...activity.predecessors.map(predId => {
                const pred = activities.find(a => a.id === predId);
                return (pred && levels[pred.id] !== undefined) ? levels[pred.id] + 1 : 0;
            }));
        }
        levels[activity.id] = level;
    });
    
    // Agrupar actividades por nivel
    let levelGroups = {};
    Object.keys(levels).forEach(id => {
        const level = levels[id];
        if (!levelGroups[level]) {
            levelGroups[level] = [];
        }
        levelGroups[level].push(parseInt(id));
    });
    
    // Posicionar los nodos por nivel
    Object.keys(levelGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach((level, levelIndex) => {
        const activityIds = levelGroups[level];
        const levelLeft = levelIndex * 300 + 50;
        
        activityIds.forEach((id, idIndex) => {
            const node = document.getElementById(`node-${id}`);
            if (node) {
                node.style.position = 'absolute';
                node.style.left = `${levelLeft}px`;
                node.style.top = `${idIndex * 200 + 50}px`;
            }
        });
    });
    
    // Calcular la altura máxima necesaria para el contenedor
    const maxLevel = Math.max(...Object.keys(levelGroups).map(Number));
    const maxItemsInAnyLevel = Math.max(...Object.values(levelGroups).map(items => items.length));
    
    diagramContainer.style.height = `${maxItemsInAnyLevel * 200 + 100}px`;
    diagramContainer.style.width = `${(maxLevel + 1) * 300 + 100}px`;
    diagramContainer.style.position = 'relative';
    diagramContainer.style.padding = '20px';
    
    // Crear las flechas para las dependencias
    activities.forEach(activity => {
        if (activity.predecessors.length > 0) {
            activity.predecessors.forEach(predId => {
                const fromNode = document.getElementById(`node-${predId}`);
                const toNode = document.getElementById(`node-${activity.id}`);
                
                if (fromNode && toNode) {
                    // Obtener las posiciones de los nodos
                    const fromRect = fromNode.getBoundingClientRect();
                    const toRect = toNode.getBoundingClientRect();
                    
                    // Calcular los puntos de conexión
                    const fromX = fromNode.offsetLeft + fromNode.offsetWidth;
                    const fromY = fromNode.offsetTop + fromNode.offsetHeight / 2;
                    const toX = toNode.offsetLeft;
                    const toY = toNode.offsetTop + toNode.offsetHeight / 2;
                    
                    // Crear la flecha
                    const arrow = document.createElement('div');
                    arrow.className = 'arrow';
                    
                    // Verificar si es una actividad ficticia
                    const pred = activities.find(a => a.id === predId);
                    if (pred && pred.isDummy) {
                        arrow.classList.add('dummy-arrow');
                    }
                    
                    // Calcular la longitud y el ángulo
                    const dx = toX - fromX;
                    const dy = toY - fromY;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    // Posicionar y rotar la flecha
                    arrow.style.position = 'absolute';
                    arrow.style.width = `${length}px`;
                    arrow.style.height = '2px';
                    arrow.style.left = `${fromX}px`;
                    arrow.style.top = `${fromY}px`;
                    arrow.style.transform = `rotate(${angle}deg)`;
                    arrow.style.transformOrigin = '0 0';
                    arrow.style.backgroundColor = '#3498db';
                    
                    // Verificar si la flecha es parte del camino crítico
                    if (pred && pred.isCritical && activity.isCritical) {
                        arrow.classList.add('critical-arrow');
                        arrow.style.backgroundColor = '#e74c3c';
                    }
                    
                    // Crear y posicionar el tiempo de la actividad
                    const activityTime = document.createElement('div');
                    activityTime.className = 'activity-time';
                    activityTime.textContent = pred.expectedTime.toFixed(1);
                    activityTime.style.position = 'absolute';
                    activityTime.style.left = `${length/2}px`;
                    activityTime.style.top = '-15px';
                    activityTime.style.transform = `rotate(${-angle}deg)`;
                    activityTime.style.transformOrigin = 'center';
                    activityTime.style.backgroundColor = 'white';
                    activityTime.style.padding = '2px 5px';
                    activityTime.style.borderRadius = '3px';
                    activityTime.style.fontSize = '12px';
                    
                    // Asegurar que la flecha esté por encima de los nodos
                    arrow.style.zIndex = '1';
                    
                    // Agregar la flecha al contenedor
                    diagramContainer.appendChild(arrow);
                    arrow.appendChild(activityTime);
                }
            });
        }
    });
} 