// Configuração global do Toastr
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

const Toast = {
    success(message) {
        toastr.success(message);
        Logger.info(`Toast Success: ${message}`);
    },
    error(message) {
        toastr.error(message);
        Logger.error(`Toast Error: ${message}`);
    },
    warning(message) {
        toastr.warning(message);
        Logger.warn(`Toast Warning: ${message}`);
    },
    info(message) {
        toastr.info(message);
        Logger.info(`Toast Info: ${message}`);
    }
};

window.Toast = Toast;