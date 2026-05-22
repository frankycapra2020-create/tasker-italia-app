import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TPL_CONFERMA   = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFERMA
const TPL_TECNICO    = import.meta.env.VITE_EMAILJS_TEMPLATE_TECNICO
const TPL_RECENSIONE = import.meta.env.VITE_EMAILJS_TEMPLATE_RECENSIONE
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const LOG_KEY = 'pt_email_log'

function addLog(entry) {
  let log = []
  try { log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') } catch {}
  log.unshift({ ...entry, timestamp: new Date().toISOString() })
  if (log.length > 200) log = log.slice(0, 200)
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

async function send(templateId, params, tipo, destinatario) {
  const stato = { tipo, destinatario, stato: 'inviata', prenotazioneId: params.booking_id }
  try {
    if (PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      console.warn('[EmailJS] Credenziali non configurate — email simulata:', tipo, destinatario)
      stato.stato = 'simulata'
    } else {
      await emailjs.send(SERVICE_ID, templateId, params, PUBLIC_KEY)
    }
  } catch (err) {
    console.error('[EmailJS] Errore invio:', err)
    stato.stato = 'errore'
    stato.errore = err?.text || String(err)
  }
  addLog(stato)
}

const MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

function fmtData(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`
}

export async function inviaEmailConferma(booking) {
  const params = {
    booking_id:       booking.id,
    cliente_nome:     booking.clienteNome,
    to_email:         booking.clienteEmail,
    tecnico_nome:     booking.tecnicoNome,
    servizio:         booking.servizio,
    data_intervento:  `${fmtData(booking.dataIntervento)} alle ${booking.oraIntervento}`,
    indirizzo:        booking.indirizzo,
    prezzo_stimato:   `€ ${Number(booking.totaleStimato ?? 0).toFixed(2)}`,
    codice:           booking.id,
  }
  await send(TPL_CONFERMA, params, 'conferma_prenotazione', booking.clienteEmail)
}

export async function inviaEmailTecnico(booking) {
  const params = {
    booking_id:      booking.id,
    to_email:        booking.tecnicoEmail || '',
    tecnico_nome:    booking.tecnicoNome,
    cliente_nome:    booking.clienteNome,
    cliente_telefono: booking.clienteTelefono || '',
    servizio:        booking.servizio,
    data_intervento: `${fmtData(booking.dataIntervento)} alle ${booking.oraIntervento}`,
    indirizzo:       booking.indirizzo,
    prezzo_stimato:  `€ ${Number(booking.totaleStimato ?? 0).toFixed(2)}`,
    descrizione:     booking.descrizione || 'Nessuna nota aggiuntiva',
    link_accetta:    `${window.location.origin}/dashboard/tecnico`,
  }
  await send(TPL_TECNICO, params, 'nuova_richiesta_tecnico', booking.tecnicoEmail || booking.tecnicoNome)
}

export async function inviaEmailRecensione(booking) {
  const params = {
    booking_id:      booking.id,
    to_email:        booking.clienteEmail,
    cliente_nome:    booking.clienteNome,
    tecnico_nome:    booking.tecnicoNome,
    servizio:        booking.servizio,
    data_intervento: fmtData(booking.dataIntervento),
    link_recensione: `${window.location.origin}/dashboard/cliente`,
  }
  await send(TPL_RECENSIONE, params, 'richiesta_recensione', booking.clienteEmail)
}

export function getEmailLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]') } catch { return [] }
}
