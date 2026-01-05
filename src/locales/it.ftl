###############
### GENERALE ###
###############
start = 
    Ciao! Sono un [bot](https://t.me/tagbotchannel/3) che ti permette di creare e gestire i *tag*.

    Un *tag* è come un #hashtag: le persone possono iscriversi e ricevere una notifica quando viene menzionato.
    Usa i tag per raggruppare le persone per argomento, interesse o ruolo.

    Digita */help* per vedere la lista dei comandi.

    _Ricordati di darmi i permessi di_ *amministratore* _per poter vedere i #tag._


help =
    👇 *Ecco la lista dei comandi!*

    🔑 *Comandi per amministratori:*
    /create tagname → _Crea un nuovo tag_
    /delete tagname → _Elimina un tag_
    /rename oldtagname newtagname → _Rinomina un tag_
    /settings → _Accedi alle impostazioni di tagbot_

    👤 *Comandi per utenti:*
    #tagname → _Menziona tutti gli utenti iscritti a un tag_
    /join tagname → _Iscriviti a un tag_
    /leave tagname → _Disiscriviti da un tag_
    /list → _Elenca tutti i tag_
    /mytags → _Elenca tutti i tag a cui sei iscritto_

    _Per segnalare un bug, suggerire una funzione o ricevere aggiornamenti sul bot, unisciti a @tagbotchannel_


restart =
    .success = ✅ La *lista amministratori* è stata aggiornata!
    .error = ❌ Si è verificato un errore durante l'aggiornamento della *lista amministratori*.

private-only =
    ✨ Questo comando funziona solo nelle *chat private*!

private-only-btn =
    👉 Tocca qui

internal-error =
    ⚠️ Si è verificato un errore interno. Riprova più tardi.

#############
### ADMIN ###
#############

admin.no-groups = 
    ⚠️ Non sei *amministratore* di alcun gruppo.

permissions =
    .create-tags-admins = ❌ Solo gli *amministratori* possono *creare* tag
    .delete-tags-admins = ❌ Solo gli *amministratori* possono eliminare tag
    .delete-tags-admins-or-creator = ❌ Solo gli *amministratori* o il creatore del tag possono *eliminarlo*
    .rename-tags-admins = ❌ Solo gli *amministratori* possono rinominare i tag
    .rename-tags-admins-or-creator = ❌ Solo gli *amministratori* o il creatore del tag possono *rinominarlo*

####################
### EVENTI GRUPPO ###
####################

bot-rejoined = 
    È bello essere di nuovo qui! Digita /help per vedere la lista dei comandi.

    _Ricordati di darmi i permessi di *amministratore* per poter rispondere ai #tag._
bot-join-error = ❌ Si è verificato un errore durante la configurazione. Prova ad aggiungermi di nuovo.
bot-promoted = Ora sono pienamente operativo!

migrate =
    .success = ✅ I tuoi tag sono stati migrati nella chat del supergruppo!
    .error = ❌ Si è verificato un errore durante la migrazione dei tag del gruppo al supergruppo!

###########
### Tag ###
###########
tag =
    .create-ok = ✅ Tag *{ $tagName }* creato
    .create-syntax = ⚠️ Sintassi: /create *tagname*

    .delete-ok = ✅ Tag *{ $tagName }* eliminato
    .delete-syntax = ⚠️ Sintassi: /delete *tagname*

    .rename-ok = ✅ Tag *{ $oldTagName }* rinominato in *{ $newTagName }*
    .rename-syntax = ⚠️ Sintassi: /rename *oldtagname* *newtagname*

    .private-message = 
        🔔📩 Sei stato taggato in *{ $groupName }* 📩🔔
        🏷️ Tag: *{ $tagName }*
        👉 Clicca [qui]({ $messageLink }) per vedere il messaggio
    .private-ok = ✅ Gli utenti in { $tagName } sono stati taggati privatamente. [Perché?](https://t.me/tagbotchannel/7)
    .private-error = ⚠️ Questi utenti non hanno avviato il bot in privato: { $notContacted }

    .validation-syntax = ⚠️ I *tag* devono avere tra 3 e 32 caratteri e possono contenere solo lettere, numeri e underscore. I tag non possono iniziare con un underscore
    .validation-already-exists = ❌ Il tag *{ $tagName }* esiste già
    
    .validation-not-found = { $count ->
        [one] ❌ Tag { $tagName } *non trovato*
        *[other] ❌ Questi tag *non esistono*: { $tagName }
    }

    .validation-empty = { $count ->
        [one] ⚠️ Il tag { $tagName } è *vuoto*
        *[other] ⚠️ Questi tag sono *vuoti*: { $tagName }
    }

    .validation-only-one = { $count ->
        [one] ⚠️ Sei l'*unico* nel tag { $tagName }
        *[other] ⚠️ Sei l'*unico* in questi tag: { $tagName }
    }
    .validation-flooding = 🕑 Puoi menzionare solo *tre tag* ogni *cinque minuti*. Rallenta!


####################
### JOIN E LEAVE ###
####################

join =
    .ok = @{ $username } si è iscritto al tag { $tagName }. Riceverà notifiche quando qualcuno lo menziona.
    .btn = Iscriviti a questo tag
    .syntax = ⚠️ Sintassi: /join *tagname*
    .start-bot-msg = Per iscriverti ai *tag*, devi avviare una *chat privata* con il bot.
    .start-bot-btn = Avvia il bot!
    .already-subscribed = ⚠️ Sei già iscritto a *{ $tagName }*

leave =
    .ok = @{ $username } ha lasciato il tag { $tagName }. Non riceverà più notifiche quando qualcuno lo menziona.
    .syntax = ⚠️ Sintassi: /leave *tagname*
    .not-subscribed = ⚠️ Non sei *iscritto* al tag { $tagName }
    

#################
### LISTA TAG ###
#################
list =
    .empty = ⚠️ Nessun *tag* trovato in questo gruppo
    .full = 👇 *Ecco la lista di tutti i tag in { $groupName }:*
    .partial = 👇 *Ecco una lista parziale dei tag in questo gruppo:*
    
    .main = 🔥 *Tag principali:*
    .other = 📝 *Altri tag:*

    .callback-success = ✅ Ti ho inviato un messaggio privato con tutti i tag!
    .callback-error = ⚠️ Non sono riuscito a inviarti un messaggio privato. Avvia prima una chat con me

mytags =
    .header = 📄 *Ecco la lista dei tag a cui sei iscritto, @{ $username }:*
    .empty = ⚠️ Non sei iscritto a nessun tag in questo gruppo, @{ $username }

tag-entry =
        - `{ $tagName }` _{ $count ->
            [one] 1 iscritto
        *[other] { $count } iscritti
        }_

################
### SETTINGS ###
################
settings =
    .main = 
        {"*🌟 Pannello di Controllo TagBot 🌟*"}
        
        👉🏻  _*Seleziona il gruppo* che vuoi gestire e personalizza le sue impostazioni._
    .group-panel = 🔑 *Gruppo:* { $groupName }
    .create = ✏️ Crea Tag
    .delete = 💣 Elimina Tag
    .rename = ✍️ Rinomina Tag
    .language = 🌐 Lingua

    .create-description = 
        ✏️ *Chi può creare i tag?*
        
        Decidi chi, in questo gruppo, ha il permesso di creare nuovi tag.  
        Impostazione attuale: { $current }.

    .delete-description = 
        💣 *Chi può eliminare i tag?*
        
        Scegli chi è autorizzato a eliminare i tag esistenti in questo gruppo.  
        Impostazione attuale: { $current }.

    .rename-description = 
        ✍️ *Chi può rinominare i tag?*
        
        Imposta chi può rinominare i tag all’interno del gruppo.  
        Impostazione attuale: { $current }.

    .language-description = 
        🌐 Seleziona la lingua del bot
        
        Scegli la lingua che il bot userà per inviare i messaggi in questo gruppo.  
        Lingua attuale: { $current }.


    .permissions-everyone = 🌍 Tutti
    .permissions-only-admins = 👑 Solo amministratori
    .permissions-admins-creators = 🛠️ Creatori di tag e amministratori
    .back = 🔙 Indietro
    .close = ✖️ Chiudi
