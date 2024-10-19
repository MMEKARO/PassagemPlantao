let patients = [];

// Função para exibir os leitos e os dados dos pacientes
function showBeds() {
    const beds = document.querySelectorAll('.bed');
    beds.forEach(bed => {
        const bedId = bed.id;
        const patient = patients.find(p => p.bedId === bedId);
        const patientName = patient ? patient.name : "Vazio";
        bed.querySelector('.patient-name').textContent = patientName;
    });
    document.getElementById('edit-form').style.display = 'none'; // Oculta o formulário
}

// Função para habilitar a adição de novos dispositivos
function enableDeviceAddition() {
    const deviceCheckboxes = document.querySelectorAll('input[name="device"]');
    const addDeviceInput = document.getElementById('new-device');
    const addDeviceButton = document.getElementById('add-device-btn');
    
    const anyDeviceChecked = Array.from(deviceCheckboxes).some(checkbox => checkbox.checked);
    addDeviceInput.disabled = !anyDeviceChecked;
    addDeviceButton.disabled = !anyDeviceChecked;
}

// Função para adicionar um novo dispositivo à lista
function addDevice() {
    const newDevice = document.getElementById('new-device').value;
    if (newDevice) {
        const deviceList = document.getElementById('device-list');
        const newDeviceItem = document.createElement('li');
        newDeviceItem.textContent = newDevice;
        deviceList.appendChild(newDeviceItem);
        document.getElementById('new-device').value = ''; // Limpa o campo de entrada
    }
}

// Função para coletar os dispositivos selecionados
function getDevices() {
    const deviceCheckboxes = document.querySelectorAll('input[name="device"]');
    const devices = [];
    deviceCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            devices.push(checkbox.value);
        }
    });
    return devices;
}

// Função para salvar as informações do leito
function saveBedInfo() {
    const bedId = document.querySelector('.bed.editing').id; // ID do leito em edição
    const patientData = {
        bedId: bedId,
        name: document.getElementById('patient-name').value,
        dob: document.getElementById('dob').value,
        age: document.getElementById('age').value,
        weight: document.getElementById('weight').value,
        isolation: document.getElementById('isolation').value,
        devices: getDevices(),
    };
    
    const existingPatientIndex = patients.findIndex(p => p.bedId === bedId);
    if (existingPatientIndex >= 0) {
        patients[existingPatientIndex] = patientData; // Atualiza dados existentes
    } else {
        patients.push(patientData); // Adiciona um novo paciente
    }
    
    alert("Informações salvas com sucesso!");
    showBeds(); // Atualiza a exibição dos leitos
}

// Função para salvar todos os dados em formato JSON
function saveDataAsJSON() {
    const dataStr = JSON.stringify(patients, null, 2); // Converte dados para formato JSON
    const blob = new Blob([dataStr], { type: 'application/json' }); // Cria um Blob
    const url = URL.createObjectURL(blob); // Cria URL do Blob

    const a = document.createElement('a'); // Cria um elemento <a> para download
    a.href = url;
    a.download = 'patients_data.json'; // Nome do arquivo para download
    document.body.appendChild(a); // Adiciona ao DOM
    a.click(); // Clica no link para iniciar download
    document.body.removeChild(a); // Remove o elemento <a> após o download
    URL.revokeObjectURL(url); // Revoga a URL do Blob
}

// Função para editar as informações de um leito
function editBed(bedId) {
    const patient = patients.find(p => p.bedId === bedId);
    if (patient) {
        document.getElementById('patient-name').value = patient.name;
        document.getElementById('dob').value = patient.dob;
        document.getElementById('age').value = patient.age;
        document.getElementById('weight').value = patient.weight;
        document.getElementById('isolation').value = patient.isolation;
        // Preencha outros campos conforme necessário
    }
    document.getElementById('edit-form').style.display = 'block'; // Exibe o formulário
}

// Inicializa a exibição dos leitos ao carregar a página
showBeds();

// Funcionalidade de arrastar e soltar
const beds = document.querySelectorAll('.bed');
let draggedBed = null;

beds.forEach(bed => {
    bed.addEventListener('dragstart', () => {
        draggedBed = bed;
        setTimeout(() => {
            bed.style.display = 'none';
        }, 0);
    });

    bed.addEventListener('dragend', () => {
        setTimeout(() => {
            draggedBed = null;
            bed.style.display = 'block';
        }, 0);
    });

    bed.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    bed.addEventListener('drop', () => {
        if (draggedBed) {
            const draggedBedId = draggedBed.id;
            const targetBedId = bed.id;

            // Troca os dados do paciente entre os leitos
            const draggedPatient = patients.find(p => p.bedId === draggedBedId);
            const targetPatient = patients.find(p => p.bedId === targetBedId);

            if (draggedPatient && targetPatient) {
                // Troca os leitos dos pacientes
                [draggedPatient.bedId, targetPatient.bedId] = [targetBedId, draggedBedId];
            } else if (draggedPatient) {
                // Mover o paciente para o leito vazio
                draggedPatient.bedId = targetBedId;
            } else if (targetPatient) {
                // Mover o paciente vazio para o leito arrastado
                targetPatient.bedId = draggedBedId;
            }

            showBeds(); // Atualiza a exibição dos leitos
        }
    });

    bed.setAttribute('draggable', true); // Torna os leitos arrastáveis
});

// Função para calcular a idade ao sair do campo de data de nascimento
function calculateAge() {
    const dob = new Date(document.getElementById('dob').value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    document.getElementById('age').value = age; // Atualiza o campo de idade
}

// Evento de clique em cada leito para habilitar a edição
document.querySelectorAll('.bed').forEach(bed => {
    bed.addEventListener('click', () => {
        editBed(bed.id);
        document.querySelectorAll('.bed').forEach(b => b.classList.remove('editing'));
        bed.classList.add('editing'); // Marca o leito como em edição
    });
});

// Adiciona evento de clique ao botão de salvar dados
document.getElementById('save-data-btn').addEventListener('click', saveDataAsJSON);

