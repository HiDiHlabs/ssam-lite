

function runTutorial() {

    var tutorialMode=true;

    var tutorialWindowNames = ['data', 'data-coords', 'data-disp', 'data-sigs', 
    'parameters', 'parameters-coordinates', 'parameters-sigma',
    'analysis-KDE', 'analysis-assignments']

    document.getElementById('tutorial-modal').style.display = 'block';
    document.getElementById('button-tutorial').removeEventListener('click', runTutorial);;
    $('.btn-next').click(function () {
        event.preventDefault();
        var sectionTo = $(this).attr('href');
        console.log(sectionTo);
        document.getElementById(sectionTo.substring(1, sectionTo.length)).scrollIntoView({ behavior: 'smooth' });
        (this).parentElement.parentElement.style.display = 'none';
        var id = this.id;
        var parent = ('tutorial-modal-' + (tutorialWindowNames[Number(id.substring(id.length - 1, id.length))]));
        document.getElementById(parent).style.display = 'block';

    });

    $('.btn-close').click(function () {
        event.preventDefault();
        console.log($(this));
        (this).parentElement.parentElement.style.display = 'none';
        document.getElementById('button-tutorial').addEventListener('click', runTutorial);
        tutorialMode = false;
    });

    // buttonTutorial.onclick = function () {
    //     tutorialMode = true;
    //     tutorialModal.style.display = 'block';
    // }

}