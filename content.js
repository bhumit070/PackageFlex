const textToReplace = 'npm i'

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		setTimeout(replaceCopyElement, 0)
	}
);

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



function changeText(htmlElement, packageName, installText = false) {
	const children = htmlElement.children
	const pELement = children[children.length - 1].children
	const codeElement = pELement[0]

	if (installText) {
		codeElement.textContent = codeElement.textContent.replace(textToReplace, `${installText} `)
	} else {
		const regex = packageManagers.map(manager => manager.install).join('|')
		const textContent = codeElement.textContent.split(new RegExp(regex))
		codeElement.textContent = codeElement.textContent.replace(textContent[textContent.length - 1], ` ${packageName}`)
	}

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

function replaceCopyElement(isFirstCall = false) {

	const packageName = window.location.href.replace(`${window.location.protocol}//${window.location.host}/package/`, '')

	if (!packageName) {
		return
	}

	const labelText = '[aria-label="Copy install command line"]'
	const copyElement = document.querySelector(labelText)

	if (!copyElement) {
		return
	}
	const parentElementOfCopyElement = copyElement?.parentElement?.parentElement

	const allCopyElements = document.querySelectorAll(labelText)

	if (allCopyElements.length < packageManagers.length) {
		for (let i = 0; i < packageManagers.length; i += 1) {
			const manager = packageManagers[i]

			const clonedElement = parentElementOfCopyElement.cloneNode(true)
			parentElementOfCopyElement.parentNode.insertBefore(changeText(addCustomCopyButton(clonedElement), packageName, manager.install), parentElementOfCopyElement.nextSibling)
		}
		parentElementOfCopyElement.remove()
	} else {
		for (let i = 0; i < allCopyElements.length; i += 1) {
			const element = allCopyElements[i].parentElement.parentElement
			const updatedElement = changeText(element, packageName)
			element.replaceWith(updatedElement)
		}
	}



}

replaceCopyElement(true);


