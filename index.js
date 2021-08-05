const puppeteer = require('puppeteer')
const axios = require('axios')
const url = 'https://www.tesla.com/es_ES/inventory/new/m3?TRIM=LRAWD&PAINT=WHITE&INTERIOR=PREMIUM_WHITE&WHEELS=EIGHTEEN&arrangeby=plh'

async function get() {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(url);
	await page.waitForSelector('.results-container')
	var existe;
	var cantidad = 0;
	var coches = [];
	existe = await page.evaluate(()=>{
		const existe = document.querySelector('.alertbox-content')
		if (existe){
			if(existe.textContent.includes('No se han encontrado')){
				return false
			}else{
				return true
			}
		}else{
			return true
		}
	})
	if (existe){
		cantidad = await page.evaluate(()=>{
			return document.querySelectorAll('.result.card').length
		})
		coches = await page.evaluate(()=>{
			var lista = []
			const coches = document.querySelectorAll('.result.card')
			coches.forEach(elem=>{
				var article = {
					title: 'Model 3 Blanco!!\n\n' + elem.children[0].children[0].children[1].innerText + ' (' + elem.children[0].children[0].children[2].innerText + ')',
					price: elem.children[0].children[1].children[0].textContent.substring(0,8)
				}
				lista.push(article)
			})
			return lista;
		})

	}
	await browser.close();
	if(cantidad > 0){
		coches.forEach(elem=>{
			axios.post('https://pushmore.io/webhook/Mj9ao7RWbdGMQpDemDAJWrs7',elem.title +'\n\n'+ elem.price +'\n\n'+ url)
		})
	}
  }
  var CronJob = require('cron').CronJob;
var job = new CronJob('0 */10 * * * *', function() {
	get()
}, null, true, 'Europe/Madrid');
job.start();