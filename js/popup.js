const redirectButton = document.getElementById('redirect-to-github')

redirectButton.addEventListener('click', () => {
	console.log('Redirecting to GitHub...', window)
	const proxy = window.open('https://github.com/bhumit070/PackageFlex')
	console.log(proxy)
})