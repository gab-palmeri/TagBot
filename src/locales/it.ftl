###############
### GENERALE ###
###############
start = 
    Ciao! Sono un <a href="https://t.me/tagbotchannel/3">bot</a> che ti permette di creare e gestire i <b>tag</b>.

    Un <b>tag</b> è come un #hashtag: le persone possono iscriversi e ricevere una notifica quando viene menzionato.
    Usa i tag per raggruppare le persone per argomento, interesse o ruolo.

    Digita <b>/help</b> per vedere la lista dei comandi.

    <i>Ricordati di darmi i permessi di</i> <b>amministratore</b> <i>per poter vedere i #tag.</i>


help =
    👇 <b>Ecco la lista dei comandi!</b>

    🔑 <b>Comandi per amministratori:</b>
    /create tagname → <i>Crea un nuovo tag</i>
    /delete tagname → <i>Elimina un tag</i>
    /rename oldtagname newtagname → <i>Rinomina un tag</i>
    /settings → <i>Accedi alle impostazioni di tagbot</i>

    👤 <b>Comandi per utenti:</b>
    #tagname → <i>Menziona tutti gli utenti iscritti a un tag</i>
    /join tagname → <i>Iscriviti a un tag</i>
    /leave tagname → <i>Disiscriviti da un tag</i>
    /list → <i>Elenca tutti i tag</i>
    /mytags → <i>Elenca tutti i tag a cui sei iscritto</i>

    <i>Per segnalare un bug, suggerire una funzione o ricevere aggiornamenti sul bot, unisciti a @tagbotchannel</i>


restart =
    .success = ✅ La <b>lista amministratori</b> è stata aggiornata!
    .error = ❌ Si è verificato un errore durante l'aggiornamento della <b>lista amministratori</b>.

private-only =
    ✨ Questo comando funziona solo nelle <b>chat private</b>!

private-only-btn =
    👉 Tocca qui

internal-error =
    ⚠️ Si è verificato un errore interno. Riprova più tardi.

#############
### ADMIN ###
#############

admin.no-groups = 
    ⚠️ Non sei <b>amministratore</b> di alcun gruppo.

permissions =
    .create-tags-admins = ❌ Solo gli <b>amministratori</b> possono <b>creare</b> tag
    .delete-tags-admins = ❌ Solo gli <b>amministratori</b> possono eliminare tag
    .delete-tags-admins-or-creator = ❌ Solo gli <b>amministratori</b> o il creatore del tag possono <b>eliminarlo</b>
    .rename-tags-admins = ❌ Solo gli <b>amministratori</b> possono rinominare i tag
    .rename-tags-admins-or-creator = ❌ Solo gli <b>amministratori</b> o il creatore del tag possono <b>rinominarlo</b>

####################
### EVENTI GRUPPO ###
####################

bot-rejoined = 
    È bello essere di nuovo qui! Digita /help per vedere la lista dei comandi.

    <i>Ricordati di darmi i permessi di <b>amministratore</b> per poter rispondere ai #tag.</i>
bot-join-error = ❌ Si è verificato un errore durante la configurazione. Prova ad aggiungermi di nuovo.
bot-promoted = Ora sono pienamente operativo!

migrate =
    .success = ✅ I tuoi tag sono stati migrati nella chat del supergruppo!
    .error = ❌ Si è verificato un errore durante la migrazione dei tag del gruppo al supergruppo!

###########
### Tag ###
###########
tag =
    .create-ok = ✅ Tag <b>{ $tagName }</b> creato
    .create-syntax = ⚠️ Sintassi: /create <b>tagname</b>

    .delete-ok = ✅ Tag <b>{ $tagName }</b> eliminato
    .delete-syntax = ⚠️ Sintassi: /delete <b>tagname</b>

    .rename-ok = ✅ Tag <b>{ $oldTagName }</b> rinominato in <b>{ $newTagName }</b>
    .rename-syntax = ⚠️ Sintassi: /rename <b>oldtagname</b> <b>newtagname</b>

    .private-message = 
        🔔📩 Sei stato taggato in <b>{ $groupName }</b> 📩🔔
        🏷️ Tag: <b>{ $tagName }</b>
        👉 Clicca <a href="{ $messageLink }">qui</a> per vedere il messaggio
    .private-ok = ✅ Gli utenti in { $tagName } sono stati taggati privatamente. <a href="https://t.me/tagbotchannel/7">Perché?</a>
    .private-error = ⚠️ Questi utenti non hanno avviato il bot in privato: { $notContacted }

    .validation-syntax = ⚠️ I <b>tag</b> devono avere tra 3 e 32 caratteri e possono contenere solo lettere, numeri e underscore. I tag non possono iniziare con un underscore
    .validation-already-exists = ❌ Il tag <b>{ $tagName }</b> esiste già
    
    .validation-not-found = { $count ->
        [one] ❌ Tag { $tagName } <b>non trovato</b>
        *[other] ❌ Questi tag <b>non esistono</b>: { $tagName }
    }
    .validation-not-found-callback = 
        ❌ Tag { $tagName } non trovato

    .validation-empty = { $count ->
        [one] ⚠️ Il tag { $tagName } è <b>vuoto</b>
        *[other] ⚠️ Questi tag sono <b>vuoti</b>: { $tagName }
    }

    .validation-only-one = { $count ->
        [one] ⚠️ Sei l'<b>unico</b> nel tag { $tagName }
        *[other] ⚠️ Sei l'<b>unico</b> in questi tag: { $tagName }
    }
    .validation-flooding = 🕑 Puoi menzionare solo <b>tre tag</b> ogni <b>cinque minuti</b>. Rallenta!


####################
### JOIN E LEAVE ###
####################

join =
    .ok = @{ $username } si è iscritto al tag { $tagName }. Riceverà notifiche quando qualcuno lo menziona.
    .ok-callback = ✅ Ti sei iscritto al tag { $tagName }. Riceverai notifiche quando qualcuno lo menziona.
    .btn = Iscriviti a questo tag
    .syntax = ⚠️ Sintassi: /join <b>tagname</b>
    .start-bot-msg = Per iscriverti ai <b>tag</b>, devi avviare una <b>chat privata</b> con il bot.
    .start-bot-btn = Avvia il bot!
    .start-bot-msg-callback = ⚠️ Per iscriverti ai tag, devi avviare una chat privata con il bot.
    .already-subscribed = ⚠️ Sei già iscritto a <b>{ $tagName }</b>
    .already-subscribed-callback = ⚠️ Sei già iscritto a { $tagName }


leave =
    .ok = @{ $username } ha lasciato il tag <b>{ $tagName }</b>. Non riceverà più notifiche quando qualcuno lo menziona.
    .syntax = ⚠️ Sintassi: /leave <b>tagname</b>
    .not-subscribed = ⚠️ Non sei <b>iscritto</b> al tag { $tagName }
    

#################
### LISTA TAG ###
#################
list =
    .empty = ⚠️ Nessun <b>tag</b> trovato in questo gruppo
    .full = 👇 <b>Ecco la lista di tutti i tag in { $groupName }:</b>
    .partial = 👇 <b>Ecco una lista parziale dei tag in questo gruppo:</b>
    
    .main = 🔥 <b>Tag principali:</b>
    .other = 📝 <b>Altri tag:</b>

    .callback-success = ✅ Ti ho inviato un messaggio privato con tutti i tag!
    .callback-error = ⚠️ Non sono riuscito a inviarti un messaggio privato. Avvia prima una chat con me

mytags =
    .header = 📄 <b>Ecco la lista dei tag a cui sei iscritto, @{ $username }:</b>
    .empty = ⚠️ Non sei iscritto a nessun tag in questo gruppo, @{ $username }

tag-entry =
        - <code>{ $tagName }</code> <i>{ $count ->
            [one] 1 iscritto
        *[other] { $count } iscritti
        }</i>

################
### SETTINGS ###
################
settings =
    .main = 
        {"<b>🌟 Pannello di Controllo TagBot 🌟</b>"}
        
        👉🏻  <i><b>Seleziona il gruppo</b> che vuoi gestire e personalizza le sue impostazioni.</i>
    .group-panel = 🔑 <b>Gruppo:</b> { $groupName }
    .create = ✏️ Crea Tag
    .delete = 💣 Elimina Tag
    .rename = ✍️ Rinomina Tag
    .language = 🌐 Lingua

    .create-description = 
        ✏️ <b>Chi può creare i tag?</b>
        
        Decidi chi, in questo gruppo, ha il permesso di creare nuovi tag.  
        Impostazione attuale: { $current }.

    .delete-description = 
        💣 <b>Chi può eliminare i tag?</b>
        
        Scegli chi è autorizzato a eliminare i tag esistenti in questo gruppo.  
        Impostazione attuale: { $current }.

    .rename-description = 
        ✍️ <b>Chi può rinominare i tag?</b>
        
        Imposta chi può rinominare i tag all’interno del gruppo.  
        Impostazione attuale: { $current }.

    .language-group-description = 
        🌐 Seleziona la lingua del bot
        
        Scegli la lingua che il bot userà per inviare i messaggi in questo gruppo.  
        Lingua attuale: { $current }.
    
    .language-private-description = 
        🌐 Seleziona la lingua del bot
        
        Scegli la lingua che il bot userà per inviare i messaggi in questa chat privata.  
        Lingua attuale: { $current }.


    .permissions-everyone = 🌍 Tutti
    .permissions-only-admins = 👑 Solo amministratori
    .permissions-admins-creators = 🛠️ Creatori di tag e amministratori
    .back = 🔙 Indietro
    .close = ✖️ Chiudi

#################
### LANGUAGES ###
#################
language =
    .it = Italiano
    .en = Inglese