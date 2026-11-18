/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin()
 {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 }

/**
 * Test: GET /api/samples/my-samples
 */
 testUtils.createTestButton("Test Listar Mis Samples", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: POST /api/samples/upload (Simulado)
 */
testUtils.createTestButton("Test Subir Sample (Simulado)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});
testUtils.createTestButton("Test Eliminar Sample Dinámico", async (btn) => {
    await okLogin();
    const token = localStorage.getItem('test_token');
    const authHeader = { 'Authorization': `Bearer ${token}` };

    const listResponse = await fetch('/api/samples/my-samples', { headers: authHeader });
    const samples = await listResponse.json();

    if (!Array.isArray(samples) || samples.length === 0) {
        testUtils.log("ADVERTENCIA: No hay samples para eliminar. Ejecute primero 'Test Subir Sample (Simulado)'.", true);
        btn.className = "w3-button w3-block w3-section w3-round w3-orange";
        return;
    }

    const targetId = samples[0].id;
    testUtils.log(`Intentando eliminar el sample con ID: ${targetId}`);

    const response = await fetch(`/api/samples/${targetId}`, {
        method: 'DELETE',
        headers: authHeader
    });
    const data = await response.json();
    testUtils.log({ idEliminado: targetId, status: response.status, respuesta: data });
    if (response.ok) testUtils.setSuccess(btn);
});
testUtils.createTestButton("Test Subir Sample - Error por Datos Faltantes", async (btn) => {
    await okLogin();
    const token = localStorage.getItem('test_token');

    const formData = new FormData();
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'SIN_DATOS.wav');   // faltan category y display_name

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    const data = await response.json();
    testUtils.log({ status: response.status, respuesta: data });
    if (response.status === 400) testUtils.setSuccess(btn);
});