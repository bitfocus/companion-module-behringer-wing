import * as fs from 'fs'
import { exit } from 'process'

let pkg
try {
	pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
} catch {
	throw new Error('Cannot parse package.json')
}

const pkgVersion = pkg.version

if (pkgVersion.includes('alpha') || pkgVersion.includes('beta') || pkgVersion.includes('rc')) {
	console.log(`Version '${pkgVersion}' is a pre-release, skipping README check`)
	exit(0)
}

let readme = ''
try {
	readme = fs.readFileSync('README.md', 'utf8')
} catch {
	throw new Error('Cannot read README.md')
}

if (!readme.includes(`## ${pkgVersion}`)) {
	throw new Error(`README.md does not contain version '${pkgVersion}'`)
}

console.log(`README.md contains version '${pkgVersion}'`)
