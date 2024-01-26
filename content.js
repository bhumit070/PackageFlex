const textToReplace = 'npm i'

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log("Message received in content script:", request);
		setTimeout(replaceCopyElement, 2 * 1000)
	}
);


function changeText(htmlElement, installText, devInstallText) {
	const children = htmlElement.children
	const pELement = children[children.length - 1].children
	const codeElement = pELement[0]
	codeElement.textContent = codeElement.textContent.replace(textToReplace, `${installText} `)
	return htmlElement
}

function addCustomCopyButton(htmlElement) {

	const children = htmlElement.children

	const pELement = children[children.length - 1].children
	const copyElement = pELement[1]
	const codeElement = pELement[0]

	const customButton = document.createElement('button')
	customButton.addEventListener('click', () => {
		const range = document.createRange();
		range.selectNode(codeElement);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
		document.execCommand("copy");
		window.getSelection().removeAllRanges();
		window.alert(`Copied -> ${codeElement.textContent}`)
	})

	customButton.attributes = copyElement.attributes
	customButton.classList = copyElement.classList
	customButton.innerHTML = copyElement.innerHTML

	const ariaLabelValue = copyElement.getAttribute('aria-label');
	customButton.setAttribute('aria-label', ariaLabelValue);


	copyElement.replaceWith(customButton)

	return htmlElement
}

const packageManagers = [
	{
		name: 'bun',
		install: 'bun install',
		devInstall: 'bun install -D'
	},
	{
		name: 'pnpm',
		install: 'pnpm i',
		devInstall: 'pnpm i -D'
	},
	{
		name: 'yarn',
		install: 'yarn add',
		devInstall: 'yarn add -D'
	},
	{
		name: 'npm',
		install: 'npm i',
		devInstall: 'npm i -D'
	}
]

function replaceCopyElement(isFirstCall = false) {
	const labelText = '[aria-label="Copy install command line"]'
	const copyElement = document.querySelector(labelText)

	if (!copyElement) {
		return
	}
	const parentElementOfCopyElement = copyElement?.parentElement?.parentElement

	for (let i = 0; i < packageManagers.length; i += 1) {
		const manager = packageManagers[i]

		const clonedElement = parentElementOfCopyElement.cloneNode(true)
		parentElementOfCopyElement.parentNode.insertBefore(changeText(addCustomCopyButton(clonedElement), manager.install, manager.devInstall), parentElementOfCopyElement.nextSibling)
	}

	parentElementOfCopyElement.remove()

}

replaceCopyElement(true);


