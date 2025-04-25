<iframe id="frame" src="create-group\create-group.html"></iframe>

const iframe = document.getElementById('frame');

iframe.onload = () => {
    const button = iframe.contentWindow.document.getElementById('create_group');
    
}