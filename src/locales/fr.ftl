###############
### GENERAL ###
###############
start = 
    Salut ! Je suis un <a href="https://t.me/tagbotchannel/3">bot</a> qui vous permet de créer et gérer des <b>tags</b>.

    Un <b>tag</b> fonctionne comme un #hashtag : les gens peuvent s’y abonner et recevoir une notification lorsqu’il est mentionné.
    Utilisez les tags pour regrouper les personnes par sujet, intérêt ou rôle.

    Tapez <b>/help</b> pour voir la liste des commandes.

    <i>Pensez à me donner</i> <b>les droits d’administrateur</b> <i>pour que je puisse voir les #tags.</i>


help =
    👇 <b>Voici la liste des commandes !</b>

    🔑 <b>Commandes administrateur :</b>
    /create tagname → <i>Créer un nouveau tag</i>
    /delete tagname → <i>Supprimer un tag</i>
    /rename oldtagname newtagname → <i>Renommer un tag</i>
    /restart → <i>Redémarrer le bot</i>
    /settings → <i>Accéder aux paramètres de TagBot</i>

    👤 <b>Commandes utilisateur :</b>
    #tagname → <i>Mentionne tous les utilisateurs abonnés à ce tag</i>
    /join tagname → <i>S’abonner à un tag</i>
    /leave tagname → <i>Se désabonner d’un tag</i>
    /list → <i>Lister tous les tags</i>
    /mytags → <i>Lister les tags auxquels vous êtes abonné</i>

    <i>Pour signaler un bug, proposer une fonctionnalité ou recevoir les mises à jour, rejoignez @tagbotchannel</i>


restart =
    .success = ✅ La <b>liste des admins</b> a été mise à jour !
    .error = ❌ Une erreur est survenue lors de la mise à jour de la <b>liste des admins</b>.

private-only =
    ✨ Cette commande fonctionne uniquement dans les <b>chats privés</b> !

private-only-btn =
    👉 Cliquez ici

flooding = 🕑 <b>Ralentis</b>, { $username } !

internal-error =
    ⚠️ Une erreur interne est survenue. Veuillez réessayer plus tard.

#############
### ADMIN ###
#############

admin =
    .no-groups = 
        ⚠️ Vous n’êtes <b>administrateur</b> d’aucun groupe.

        🛠️ <i>Vous ne voyez pas un groupe dont vous êtes admin ? 
        Envoyez /restart là-bas et réessayez</i>

permissions =
    .create-tags-admins = ❌ Seuls les <b>admins</b> peuvent <b>créer</b> des tags
    .delete-tags-admins = ❌ Seuls les <b>admins</b> peuvent supprimer des tags
    .delete-tags-admins-or-creator = ❌ Seuls les <b>admins</b> ou le créateur du tag peuvent le <b>supprimer</b>
    .rename-tags-admins = ❌ Seuls les <b>admins</b> peuvent renommer les tags
    .rename-tags-admins-or-creator = ❌ Seuls les <b>admins</b> ou le créateur du tag peuvent le <b>renommer</b>

####################
### GROUP EVENTS ###
####################

bot-rejoined = 
    Je suis de retour ! Tapez /help pour voir la liste des commandes.

    <i>Pensez à me donner les <b>droits d’administrateur</b> pour que je puisse répondre aux #tags.</i>
bot-join-error = ❌ Une erreur est survenue lors de l’installation. Essayez de m’ajouter à nouveau.
bot-promoted = ✅ Je suis maintenant <b>entièrement opérationnel</b> !

migrate =
    .success = ✅ Vos <b>tags</b> ont été migrés vers le <i>supergroupe</i> !
    .error = ❌ Une <b>erreur</b> est survenue lors de la migration des tags vers le <i>supergroupe</i> !

###########
### Tag ###
###########
tag =
    .create-ok = ✅ Tag <b>{ $tagName }</b> créé
    .create-syntax = ⚠️ Syntaxe : /create <b>tagname</b>

    .delete-ok = ✅ Tag <b>{ $tagName }</b> supprimé
    .delete-syntax = ⚠️ Syntaxe : /delete <b>tagname</b>

    .rename-ok = ✅ Tag <b>{ $oldTagName }</b> renommé en <b>{ $newTagName }</b>
    .rename-syntax = ⚠️ Syntaxe : /rename <b>oldtagname</b> <b>newtagname</b>

    .private-message = 
        🔔📩 Vous avez été mentionné dans <b>{ $groupName }</b> 📩🔔
        🏷️ Tag : <b>{ $tagName }</b>
        👉 Cliquez <a href="{ $messageLink }">ici</a> pour voir le message
    .private-ok = ✅ Les utilisateurs dans { $tagName } ont été mentionnés en privé. <a href="https://t.me/tagbotchannel/7">Pourquoi ?</a>
    .private-error = ⚠️ Ces utilisateurs n’ont pas démarré le bot en privé : { $notContacted }

    .validation-syntax = ⚠️ Les <b>tags</b> doivent comporter entre 3 et 32 caractères et ne contenir que des lettres, chiffres et underscores. Les tags ne peuvent pas commencer par un underscore
    .validation-already-exists = ❌ Le tag <b>{ $tagName }</b> existe déjà
    
    .validation-not-found = { $count ->
        [one] ❌ Tag { $tagName } <b>non trouvé</b>
        *[other] ❌ Ces tags <b>n’existent pas</b> : { $tagName }
    }
    .validation-not-found-callback = 
        ❌ Tag { $tagName } non trouvé

    .validation-empty = { $count ->
        [one] ⚠️ Le tag { $tagName } est <b>vide</b>
        *[other] ⚠️ Ces tags sont <b>vides</b> : { $tagName }
    }

    .validation-only-one = { $count ->
        [one] ⚠️ Vous êtes le <b>seul</b> dans le tag { $tagName }
        *[other] ⚠️ Vous êtes le <b>seul</b> dans ces tags : { $tagName }
    }
    .validation-flooding = 🕑 Vous ne pouvez mentionner que <b>trois tags</b> toutes les <b>cinq minutes</b>. Ralentissez !

######################
### JOIN AND LEAVE ###
######################

join =
    .ok = @{ $username } a rejoint le tag { $tagName }. Il sera notifié lors de chaque mention.
    .ok-callback = ✅ Vous avez rejoint le tag { $tagName }. Vous serez notifié lors de chaque mention.
    .btn = Rejoindre ce tag
    .syntax = ⚠️ Syntaxe : /join <b>tagname</b>
    .start-bot-msg = ⚠️ Pour rejoindre des <b>tags</b>, vous devez démarrer un chat privé avec le bot.
    .start-bot-btn = Démarrer le bot !
    .start-bot-msg-callback = ⚠️ Pour rejoindre des tags, vous devez démarrer un chat privé avec le bot.
    .already-subscribed = ⚠️ Vous êtes déjà abonné à <b>{ $tagName }</b>
    .already-subscribed-callback = ⚠️ Vous êtes déjà abonné à { $tagName }

leave =
    .ok = @{ $username } a quitté le tag <b>{ $tagName }</b>. Il ne sera plus notifié.
    .syntax = ⚠️ Syntaxe : /leave <b>tagname</b>
    .not-subscribed = ⚠️ Vous n’êtes pas abonné au tag { $tagName }

#################
### TAGS LIST ###
#################
list =
    .empty = ⚠️ Aucun <b>tag</b> trouvé dans ce groupe
    .full = 👇 <b>Voici la liste de tous les tags dans { $groupName } :</b>
    .partial = 👇 <b>Voici une liste partielle des tags dans ce groupe :</b>
    
    .main = 🔥 <b>Tags principaux :</b>
    .other = 📝 <b>Autres tags :</b>

    .callback-success = ✅ Je vous ai envoyé un message privé avec tous les tags !
    .callback-error = ⚠️ Je n’ai pas pu vous envoyer de message privé. Veuillez d’abord démarrer un chat avec moi

    .see-all-tags = 👉 Voir tous les tags

mytags =
    .header = 📄 <b>Voici la liste des tags auxquels vous êtes abonné, @{ $username } :</b>
    .empty = ⚠️ Vous n’êtes abonné à aucun tag dans ce groupe, @{ $username }

tag-entry =
    - <code>{ $tagName }</code> <i>{ $count ->
        [0] 0 abonné
        [one] 1 abonné
       *[other] { $count } abonnés
    }</i>

################
### SETTINGS ###
################

settings-main =
    .header = <b>🌟 Panneau de contrôle TagBot 🌟</b>
    .description = 
        👉🏻 <i>Sélectionnez le groupe à gérer.</i>

        🛠️ <i>Vous ne voyez pas un groupe dont vous êtes admin ? Envoyez /restart là-bas et réessayez</i>
    .permissions = 🛡️ Permissions 🛡️

settings-group =
    .header = 👉🏻 <b>Groupe :</b> { $groupName }
    .description =
        ⚙️ <i>Gérez qui peut utiliser les commandes du bot, la langue et supprimez les tags inutilisés</i>.

settings-create = 
    .header = ✏️ <b>Qui peut créer des tags ?</b>
    .description = <i>Choisissez qui peut créer de nouveaux tags dans ce groupe.</i>
    .btn = ✏️ /create

settings-delete = 
    .header = 💣 <b>Qui peut supprimer des tags ?</b>
    .description = <i>Choisissez qui peut supprimer des tags existants dans ce groupe.</i>
    .btn = 💣 /delete

settings-rename = 
    .header = ✍️ <b>Qui peut renommer des tags ?</b>
    .description = <i>Choisissez qui peut renommer des tags dans le groupe.</i>
    .btn = ✍️ /rename

settings-current = <u>Paramètre actuel :</u> { $current }

settings-permissions =
    .everyone = 🌍 Tout le monde
    .only-admins = 👑 Administrateurs uniquement
    .admins-creators = 🔧 Créateurs de tags & admins

settings-language =
    .header = 🌐 <b>Choisir la langue du bot</b>
    .description-group = <i>Choisissez la langue utilisée par le bot pour envoyer des messages dans ce groupe.</i> 
    .description-private = <i>Choisissez la langue utilisée par le bot dans ce chat privé.</i>
    .current = <u>Langue actuelle :</u> { $current }
    .btn = 🌐 Langue

settings-manage-tags =
    .header = 🗑️ <i>Sélectionnez les tags à afficher.</i>
    .btn = 🗑️ Tags inutilisés

settings-del-empty =
    .header = 🫙 <b>Supprimer les tags vides</b>
    .description = 
        <i>Ce sont des tags sans abonnés.</i>
        <i>Vous pouvez les supprimer un par un ou tous en même temps.</i>
    
        <i>👇 Appuyez sur un tag ou sur "Tout supprimer" pour commencer.</i>

    .all = 🗑️ Tout supprimer
    .btn = 🫙 Tags vides
    .none = ⚠️ Aucun tag vide trouvé

settings-del-inactive =
    .header = ⏳ <b>Supprimer les tags inactifs</b>
    .description =
        <i>Ce sont des tags qui n’ont pas été utilisés depuis un moment.</i>
        <i>Vous pouvez les supprimer un par un ou selon un seuil d’inactivité :</i>

        🕒 <b>3m</b> : inactif depuis plus de 3 mois
        🕒 <b>6m</b> : inactif depuis plus de 6 mois
        🕒 <b>12m</b> : inactif depuis plus d’un an

    .btn = 📜 Tags inactifs
    .none = ⚠️ Aucun tag inactif trouvé

settings-misc =
    .confirm = ⚠️ Êtes-vous sûr ?
    .cancel = ⬅️ Annuler
    .back = ⬅️ Retour
    .close = ✖️ Fermer

#################
### LANGUAGES ###
#################
language =
    .it = Italien
    .en = Anglais
    .ru = Russe
    .fr = Français
    .es = Espagnol