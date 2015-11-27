$(function() {
    
    var fruits = new JSelect(document.getElementById("fruits"), {
        id: "fruits-jselect",
        placeholder: "Choose fruit",
        size: 2
    });

    var colours = new JSelect(document.getElementById("colours"), {
        id: "colours-jselect",
        placeholder: "Choose colour",
        size: 4
    });
    
    $("#jobs").jSelect({
        id: "jobs-jselect",
        placeholder: "Choose job"
    });
    
});