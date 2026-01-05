###############
### GENERAL ###
###############
start = 
    Ciao! Sono un [bot](https://t.me/tagbotchannel/3) che ti permette di creare e gestire i *tag*.

    Un *tag* è come un #hashtag: le persone possono iscriversi e ricevere una notifica quando viene menzionato.
    Usa i tag per raggruppare le persone per argomento, interesse o ruolo.

    Digita */help* per vedere la lista dei comandi.

    _Ricordati di darmi i permessi di_ *amministratore* _così che io possa vedere i #tag._

help = 
    👇 *Ecco la lista dei comandi!*

    🔑 *Comandi Admin:*
    /create tagname → _Crea un nuovo tag_
    /delete tagname → _Elimina un tag_
    /rename oldtagname newtagname → _Rinomina un tag_
    /settings → _Accedi alle impostazioni del bot_

    👤 *Comandi Utente:*
    #tagname → _Menziona tutti gli utenti iscritti a un tag_
    /join tagname → _Unisciti a un tag_
    /leave tagname → _Lascia un tag_
    /list → _Lista di tutti i tag_
    /mytags → _Lista dei tag a cui sei iscritto_

    _Per segnalare un bug, suggerire una funzione o ricevere aggiornamenti, unisciti a @tagbotchannel_

restart = 
    .success = ✅ La *lista admin* è stata aggiornata!
    .error = ❌ Si è verificato un errore durante l'aggiornamento della *lista admin*.

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
    ⚠️ Non sei un *amministratore* di alcun gruppo.

permissions = 
    .create-tags-admins = ❌ Solo gli *admin* possono *creare* tag
    .delete-tags-admins = ❌ Solo gli *admin* possono eliminare tag
    .delete-tags-admins-or-creator = ❌ Solo gli *admin* o il creatore di questo tag possono *eliminarlo*
    .rename-tags-admins = ❌ Solo gli *admin* possono rinominare tag
    .rename-tags-admins-or-creator = ❌ Solo gli *admin* o il creatore di questo tag possono *rinominarlo*

####################
### GROUP EVENTS ###
####################

bot-rejoined = 
    È bello essere tornati! Digita /help per vedere la lista dei comandi.

    _Ricordati di darmi i permessi di *amministratore* così che io possa rispondere ai #tag._
bot-join-error = ❌ Si è verificato un errore durante la configurazione. Prova ad aggiungermi di nuovo.
bot-promoted = Ora sono completamente operativo!

migrate = 
    .success = ✅ I tuoi tag sono stati migrati nella chat del supergruppo!
    .error = ❌ Si è verificato un errore durante la migrazione dei tag nel supergruppo!

###########
### TAG ###
###########
tag = 
    .create-ok = ✅ Tag *{ $tagName }* creato con successo
    .create-syntax = ⚠️ Sintassi: /create *nome_tag*

    .delete-ok = ✅ Tag *{ $tagName }* eliminato
    .delete-syntax = ⚠️ Sintassi: /delete *nome_tag*

    .rename-ok = ✅ Tag *{ $oldTagName }* rinominato in *{ $newTagName }*
    .rename-syntax = ⚠️ Sintassi: /rename *vecchio_nome* *nuovo_nome*

    .private-message = 
        🔔📩 Sei stato taggato in *{ $groupName }* 📩🔔
        🏷️ Tag: *{ $tagName }*
        👉 Clicca [qui]({ $messageLink }) per vedere il messaggio
    .private-ok = ✅ Gli utenti in { $tagName } sono stati taggati privatamente. [Perché?](https://t.me/tagbotchannel/7)
    .private-error = ⚠️ Questi utenti non hanno avviato il bot in privato: { $notContacted }

    .validation-syntax = ⚠️ I *tag* devono avere una lunghezza compresa tra 3 e 32 caratteri e possono contenere solo lettere, numeri e underscore. I tag non possono iniziare con un underscore
    .validation-not-found = ❌ Tag *{ $tagName }* non trovato
    .validation-already-exists = ❌ Il tag *{ $tagName }* esiste già
    .validation-empty-one = ⚠️ Il tag { $tags } è *vuoto*
    .validation-empty-other = ⚠️ Questi tag sono *vuoti*: { $tags }
    .validation-non-existent-one = ❌ Il tag { $tags } *non esiste*
    .validation-non-existent-other = ❌ Questi tag *non esistono*: { $tags }
    .validation-only-one-one = ⚠️ Sei l'*unico* nel tag { $tags }
    .validation-only-one-other = ⚠️ Sei l'*unico* in questi tag: { $tags }
    .validation-flooding = 🕑 Puoi menzionare solo *tre tag* ogni *cinque minuti*. Rallenta!

######################
### JOIN AND LEAVE ###
######################

join = 
    .ok = @{ $username } si è unito al tag { $tagName }. Riceverà una notifica quando qualcuno lo menziona.
    .btn = Unisciti a questo tag
    .syntax = ⚠️ Sintassi: /join *nome_tag*
    .start-bot-msg = Per unirti ai *tag*, devi avviare una *chat privata* con il bot.
    .start-bot-btn = Avvia il bot!
    .already-subscribed = ⚠️ Sei già iscritto a *{ $tagName }*

leave = 
    .ok = @{ $username } ha lasciato il tag { $tagName }. Non riceverà più notifiche per questo tag.
    .syntax = ⚠️ Sintassi: /leave *nome_tag*
    .not-subscribed = ⚠️ Non sei *iscritto* al tag { $tagName }

#################
### TAGS LIST ###
#################
list = 
    .empty = ⚠️ Nessun *tag* trovato in questo gruppo
    .full = 👇 *Ecco la lista di tutti i tag in { $groupName }:*
    .partial = 👇 *Ecco una lista parziale dei tag in questo gruppo:*
    
    .main = 🔥 *Tag principali:*
    .other = 📝 *Altri tag:*

    .callback-success = ✅ Ti ho inviato un messaggio privato con tutti i tag!
    .callback-error = ⚠️ Non ho potuto inviarti un messaggio privato. Per favore, avvia prima una chat con me

mytags = 
    .header = 📄 *Ecco la lista dei tag in cui sei presente, @{ $username }:*
    .empty = ⚠️ Non sei iscritto a nessun tag in questo gruppo, @{ $username }

tag-entry = 
        - `{ $tagName }` _{ $count ->
            [one] 1 iscritto
           *[other] { $count } iscritti
        }_