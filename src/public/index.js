
// Connect to the socket.io server
const socket = io('/', { transports : ['websocket'] });

socket.on('connect', () => {
  console.log('Connected to the server');
});

// Listen for the log event
socket.on('logs', (data) => {
  // Append the log message to the logs div
  document.getElementById('logs').innerText += data;
});

// Get the form element
const form = document.getElementById('deployForm');

// Listen for the form submit event
form.addEventListener('submit', (event) => {
  // Prevent the default form submission
  event.preventDefault();
  document.getElementById('logs').innerText = '';

  const body = {
    githubRepoUrl: form.githubRepoUrl.value,
    buildCommand: form.buildCommand.value
  };

  fetch(`/deployments`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(async (response) => {
    if (!response.ok) {
      alert(JSON.stringify(await response.json()));
    }
  })
  .catch(error => {
    // Log the error
    console.error(error);
    alert(JSON.stringify(error));
  });
});
