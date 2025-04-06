import networkx as nx
import matplotlib.pyplot as plt
import pandas as pd

# Tu tabla de datos (sin cambios)
data = {
    'Actividad': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    'Precedente': ['-', '1', '2', '3', '4', '5', '6', '7', '8', '9', '9', '11'],
    'Tiempo Optimista (a)': [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1, 2],
    'Tiempo Más Probable (m)': [3, 2, 2, 3, 2, 3, 2, 3, 3, 2, 2, 3],
    'Tiempo Pesimista (b)': [4, 3, 3, 4, 3, 4, 3, 4, 4, 3, 3, 4],
    'Descripción': [
        'Investigar problemas en el análisis de encuestas abiertas.',
        'Analizar cómo se resuelve actualmente este problema.',
        'Confirmar que la falta de automatización en encuestas abiertas es una problemática real.',
        'Definir una solución basada en inteligencia artificial y NLP.',
        'Esquematizar cómo funcionará el sistema multiagente.',
        'Evaluar la viabilidad técnica y económica de la solución.',
        'Identificar sectores y empresas que podrían necesitar el producto.',
        'Contacto con potenciales usuarios para validar el problema.',
        'Analizar tecnologías adecuadas para NLP y sistemas multiagente.',
        'Evaluar cómo desarrollar una demo funcional del producto.',
        'Identificación de interesados y sus necesidades.',
        'Realizar el análisis de riesgos iniciales.'
    ]
}

df = pd.DataFrame(data)
df['te'] = (df['Tiempo Optimista (a)'] + 4 * df['Tiempo Más Probable (m)'] + df['Tiempo Pesimista (b)']) / 6
G = nx.DiGraph()
for index, row in df.iterrows():
    G.add_node(row['Actividad'], duration=row['te'], description=row['Descripción'])
for index, row in df.iterrows():
    predecesores = row['Precedente']
    if predecesores != '-':
        preds = predecesores.split(',')
        for pred in preds:
            G.add_edge(pred.strip(), row['Actividad'])

es = {}
ef = {}
sorted_nodes = list(nx.topological_sort(G))
for node in sorted_nodes:
    predecessor_efs = [ef[pred] for pred in G.predecessors(node)]
    if not predecessor_efs:
        es[node] = 0
    else:
        es[node] = max(predecessor_efs)
    ef[node] = es[node] + G.nodes[node]['duration']

ls = {}
lf = {}
last_node = sorted_nodes[-1]
lf[last_node] = ef[last_node]
ls[last_node] = lf[last_node] - G.nodes[last_node]['duration']
reversed_sorted_nodes = list(reversed(sorted_nodes[:-1]))
for node in reversed_sorted_nodes:
    successor_ls = [ls[succ] for succ in G.successors(node)]
    if not successor_ls:
        lf[node] = ef[last_node]
    else:
        lf[node] = min(successor_ls)
    ls[node] = lf[node] - G.nodes[node]['duration']

slack = {}
for node in G.nodes:
    slack[node] = ls[node] - es[node]

critical_path = [node for node in G.nodes if slack[node] == 0]
critical_edges = []
for u, v in G.edges:
    if u in critical_path and v in critical_path and nx.has_path(G, u, v):
        critical_edges.append((u, v))

# ------------------------------------------------------------------------------
# 7. Visualización del Gráfico PERT (Orden Descendente)
# ------------------------------------------------------------------------------

plt.figure(figsize=(14, 10))
# Usamos el orden de las actividades en el DataFrame para intentar una disposición descendente
ordered_nodes = df['Actividad'].tolist()
pos = {}
for i, node in enumerate(ordered_nodes):
    # Asignamos la misma coordenada x (puedes ajustar esto) y una coordenada y descendente
    pos[node] = (0, -i)  # El valor de y disminuye a medida que el índice aumenta

# Ajustar la posición x para que no se superpongan (puedes usar un layout inicial y luego ajustar y)
initial_pos = nx.spring_layout(G, seed=42)
for node in ordered_nodes:
    if node in initial_pos:
        pos[node] = (initial_pos[node][0], pos[node][1] * 5) # Multiplicar y para espaciar

node_colors = ['red' if node in critical_path else 'lightblue' for node in G.nodes]
edge_colors = ['red' if edge in critical_edges else 'gray' for edge in G.edges]
edge_alphas = [0.5 if edge not in critical_edges else 1.0 for edge in G.edges]

nx.draw(G, pos, with_labels=True, node_color=node_colors, edge_color=edge_colors,
        width=2, alpha=0.7, style='dashed', connectionstyle='arc3,rad=0.1')
nx.draw_networkx_edges(G, pos, edgelist=critical_edges, width=3, edge_color='red')

node_labels = {
    node: f"{node}\nES:{es[node]:.2f}, EF:{ef[node]:.2f}\nLS:{ls[node]:.2f}, LF:{lf[node]:.2f}\nSlack:{slack[node]:.2f}"
    for node in G.nodes
}
nx.draw_networkx_labels(G, pos, labels=node_labels, font_size=9, verticalalignment='bottom')

edge_labels = {(u, v): f"{G.nodes[v]['duration']:.2f}" for u, v in G.edges}
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=9, label_pos=0.3)

plt.title("Gráfico PERT del Proyecto (Orden Descendente)", fontsize=16)
plt.gca().invert_yaxis() # Invertir el eje y para que el orden sea descendente (arriba a abajo)
plt.axis('off') # Ocultar los ejes
plt.show()

# ------------------------------------------------------------------------------
# 8. Impresión de Resultados (sin cambios)
# ------------------------------------------------------------------------------

print("\n--- Resultados del Análisis PERT ---")
print("\nTiempos Esperados (te) por Actividad:")
print(df[['Actividad', 'Descripción', 'te']].round(2))
print("\nTiempos de Inicio y Fin (ES, EF, LS, LF) y Holgura por Actividad:")
for node in sorted_nodes:
    print(f"Actividad {node}:")
    print(f"  Descripción: {G.nodes[node]['description']}")
    print(f"  Tiempo Esperado (te): {G.nodes[node]['duration']:.2f}")
    print(f"  Early Start (ES): {es[node]:.2f}")
    print(f"  Early Finish (EF): {ef[node]:.2f}")
    print(f"  Late Start (LS): {ls[node]:.2f}")
    print(f"  Late Finish (LF): {lf[node]:.2f}")
    print(f"  Holgura (Slack): {slack[node]:.2f}\n")
print("\nRuta Crítica:", critical_path)
print(f"Duración Total Estimada del Proyecto: {ef[last_node]:.2f}")
print("\n--- Fin del Análisis ---")