function showToastMessage(head, small, body, time) {
	if (time) {
		time = 5000
	}
	if (head=='') {
		head = 'Merging Galaxy'
	}
	var toast = ToastTemplate.clone()
	toast.find('strong').text(head)
	toast.find('small').text(small)
	toast.find('.toast-body').html(body)
	$("#toast-container").append(toast)
	toast.on('hidden.bs.toast', function () {
		this.remove()
	})
	if (time) {
		$("div.toast").attr('data-delay', time)
	}
	toast.toast('show')
}

function showErrorMessage(msg) {
	showToastMessage('Error', '', msg, 5000)
}