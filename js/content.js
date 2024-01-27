const textToReplace = 'npm i'

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		setTimeout(replaceCopyElement, 0)
	}
);

const packageManagers = [
	{
		name: 'bun',
		install: 'bun i',
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
		return htmlElement
	}

	const packageManagerName = codeElement.getAttribute('name')
	if (packageManagerName) {
		const manager = packageManagers.find(manager => manager.name === packageManagerName)
		if (manager) {
			codeElement.textContent = `${manager.install} ${packageName}`
		}
		return htmlElement
	}

	// just in case above if does not work :)
	const regex = packageManagers.map(manager => manager.install).join('|')
	const textContent = codeElement.textContent.split(new RegExp(regex))
	codeElement.textContent = codeElement.textContent.replace(textContent[textContent.length - 1], ` ${packageName}`)

	return html
}


function addCustomCopyButton(htmlElement, packageManagerName) {

	const children = htmlElement.children

	const pELement = children[children.length - 1].children
	const copyElement = pELement[1]
	const codeElement = pELement[0]
	codeElement.setAttribute('name', packageManagerName)

	const customButton = document.createElement('button')
	customButton.addEventListener('click', () => {
		const range = document.createRange();
		range.selectNode(codeElement);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
		document.execCommand("copy");
		window.getSelection().removeAllRanges();

		const successAlert = document.createElement('div');
		successAlert.style.cssText = "position: absolute; top: 0; left: 0; width: 100vw; padding: 15px; border: 1px solid #d6d6d6; border-radius: 5px; background-color: #d4edda; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: left; z-index: 2;";
		successAlert.innerHTML = "<span style='margin-right: 0; float: left;'> ✔ Copied to clipboard! </span><span style='cursor: pointer; float: right;' onclick='this.parentElement.style.display=\"none\";'>×</span>";
		document.body.appendChild(successAlert);

		setTimeout(() => {
			document.body.removeChild(successAlert)
		}, 3 * 1000)

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

	const packageName = window.location.href.replace(`${window.location.protocol}//${window.location.host}/package/`, '').replace(window.location.hash, '').replace(window.location.search, '')

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
			parentElementOfCopyElement.parentNode.insertBefore(changeText(addCustomCopyButton(clonedElement, manager.name), packageName, manager.install), parentElementOfCopyElement.nextSibling)
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


