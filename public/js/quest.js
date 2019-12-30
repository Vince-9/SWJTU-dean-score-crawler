window.onload = function() {
    window.mainApp = new Vue({
        el: '#mainApp',
        data: {
            questData: questData
        },
        methods: {
            handleShowAnsClick(e) {
                console.log(e.target.getAttribute('data-ans'));
                e.target.setAttribute('value', e.target.getAttribute('data-ans'))
            }
        }
    })
    console.log(questData);
}