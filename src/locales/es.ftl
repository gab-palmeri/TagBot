###############
### GENERAL ###
###############
start = 
    ¡Hola! Soy un <a href="https://t.me/tagbotchannel/3">bot</a> que te permite crear y gestionar <b>tags</b>.

    Un <b>tag</b> funciona como un #hashtag: las personas pueden suscribirse y recibir notificaciones cuando se menciona.
    Usa los tags para agrupar personas por tema, interés o rol.

    Escribe <b>/help</b> para ver la lista de comandos.

    <i>Recuerda darme</i> <b>permisos de administrador</b> <i>para que pueda ver los #tags.</i>


help =
    👇 <b>¡Aquí está la lista de comandos!</b>

    🔑 <b>Comandos de administrador:</b>
    /create tagname → <i>Crear un nuevo tag</i>
    /delete tagname → <i>Eliminar un tag</i>
    /rename oldtagname newtagname → <i>Renombrar un tag</i>
    /restart → <i>Reiniciar el bot</i>
    /settings → <i>Acceder a la configuración de TagBot</i>

    👤 <b>Comandos de usuario:</b>
    #tagname → <i>Menciona a todos los usuarios suscritos a un tag</i>
    /join tagname → <i>Unirse a un tag</i>
    /leave tagname → <i>Abandonar un tag</i>
    /list → <i>Listar todos los tags</i>
    /mytags → <i>Listar los tags a los que estás suscrito</i>

    <i>Para reportar un error, sugerir una función o recibir actualizaciones, únete a @tagbotchannel</i>


restart =
    .success = ✅ La <b>lista de administradores</b> se ha actualizado!
    .error = ❌ Ocurrió un error al actualizar la <b>lista de administradores</b>.

private-only =
    ✨ ¡Este comando funciona solo en <b>chats privados</b>!

private-only-btn =
    👉 Toca aquí

flooding = 🕑 <b>Más despacio</b>, { $username }!

internal-error =
    ⚠️ Ocurrió un error interno. Por favor, inténtalo más tarde.

#############
### ADMIN ###
#############

admin =
    .no-groups = 
        ⚠️ No eres <b>administrador</b> de ningún grupo.

        🛠️ <i>¿No ves un grupo donde eres admin? Envía /restart allí e inténtalo de nuevo</i>

permissions =
    .create-tags-admins = ❌ Solo los <b>admins</b> pueden <b>crear</b> tags
    .delete-tags-admins = ❌ Solo los <b>admins</b> pueden eliminar tags
    .delete-tags-admins-or-creator = ❌ Solo los <b>admins</b> o el creador del tag pueden <b>eliminarlo</b>
    .rename-tags-admins = ❌ Solo los <b>admins</b> pueden renombrar tags
    .rename-tags-admins-or-creator = ❌ Solo los <b>admins</b> o el creador del tag pueden <b>renombrarlo</b>

####################
### GROUP EVENTS ###
####################

bot-rejoined = 
    ¡Es bueno estar de vuelta! Escribe /help para ver la lista de comandos.

    <i>Recuerda darme permisos de <b>administrador</b> para poder responder a los #tags.</i>
bot-join-error = ❌ Ocurrió un error durante la configuración. Intenta agregarme de nuevo.
bot-promoted = ✅ ¡Ahora estoy <b>totalmente operativo</b>!

migrate =
    .success = ✅ ¡Tus <b>tags</b> han sido migrados al <i>supergrupo</i>!
    .error = ❌ Ocurrió un <b>error</b> al migrar los tags al <i>supergrupo</i>!

###########
### Tag ###
###########
tag =
    .create-ok = ✅ Tag <b>{ $tagName }</b> creado
    .create-syntax = ⚠️ Sintaxis: /create <b>tagname</b>

    .delete-ok = ✅ Tag <b>{ $tagName }</b> eliminado
    .delete-syntax = ⚠️ Sintaxis: /delete <b>tagname</b>

    .rename-ok = ✅ Tag <b>{ $oldTagName }</b> renombrado a <b>{ $newTagName }</b>
    .rename-syntax = ⚠️ Sintaxis: /rename <b>oldtagname</b> <b>newtagname</b>

    .private-message = 
        🔔📩 Has sido mencionado en <b>{ $groupName }</b> 📩🔔
        🏷️ Tag: <b>{ $tagName }</b>
        👉 Haz clic <a href="{ $messageLink }">aquí</a> para ver el mensaje
    .private-ok = ✅ Los usuarios en { $tagName } han sido mencionados en privado. <a href="https://t.me/tagbotchannel/7">¿Por qué?</a>
    .private-error = ⚠️ Estos usuarios no iniciaron el bot en privado: { $notContacted }

    .validation-syntax = ⚠️ Los <b>tags</b> deben tener entre 3 y 32 caracteres y solo pueden contener letras, números y guiones bajos. Los tags no pueden empezar con un guion bajo
    .validation-already-exists = ❌ El tag <b>{ $tagName }</b> ya existe
    
    .validation-not-found = { $count ->
        [one] ❌ Tag { $tagName } <b>no encontrado</b>
        *[other] ❌ Estos tags <b>no existen</b>: { $tagName }
    }
    .validation-not-found-callback = 
        ❌ Tag { $tagName } no encontrado

    .validation-empty = { $count ->
        [one] ⚠️ El tag { $tagName } está <b>vacío</b>
        *[other] ⚠️ Estos tags están <b>vacíos</b>: { $tagName }
    }

    .validation-only-one = { $count ->
        [one] ⚠️ Eres el <b>único</b> en el tag { $tagName }
        *[other] ⚠️ Eres el <b>único</b> en estos tags: { $tagName }
    }
    .validation-flooding = 🕑 Solo puedes mencionar <b>tres tags</b> cada <b>cinco minutos</b>. ¡Más despacio!

######################
### JOIN AND LEAVE ###
######################

join =
    .ok = @{ $username } se unió al tag { $tagName }. Será notificado cuando alguien lo mencione.
    .ok-callback = ✅ Te has unido al tag { $tagName }. Serás notificado cuando alguien lo mencione.
    .btn = Unirse a este tag
    .syntax = ⚠️ Sintaxis: /join <b>tagname</b>
    .start-bot-msg = ⚠️ Para unirte a <b>tags</b>, debes iniciar un chat privado con el bot.
    .start-bot-btn = ¡Iniciar bot!
    .start-bot-msg-callback = ⚠️ Para unirte a tags, debes iniciar un chat privado con el bot.
    .already-subscribed = ⚠️ Ya estás suscrito a <b>{ $tagName }</b>
    .already-subscribed-callback = ⚠️ Ya estás suscrito a { $tagName }

leave =
    .ok = @{ $username } abandonó el tag <b>{ $tagName }</b>. Ya no recibirá notificaciones.
    .syntax = ⚠️ Sintaxis: /leave <b>tagname</b>
    .not-subscribed = ⚠️ No estás suscrito al tag { $tagName }

#################
### TAGS LIST ###
#################
list =
    .empty = ⚠️ No se encontraron <b>tags</b> en este grupo
    .full = 👇 <b>Aquí está la lista de todos los tags en { $groupName }:</b>
    .partial = 👇 <b>Aquí está una lista parcial de los tags en este grupo:</b>
    
    .main = 🔥 <b>Tags principales:</b>
    .other = 📝 <b>Otros tags:</b>

    .callback-success = ✅ ¡Te he enviado un mensaje privado con todos los tags!
    .callback-error = ⚠️ No pude enviarte un mensaje privado. Primero inicia un chat conmigo

    .see-all-tags = 👉 Ver todos los tags

mytags =
    .header = 📄 <b>Aquí está la lista de los tags a los que estás suscrito, @{ $username }:</b>
    .empty = ⚠️ No estás suscrito a ningún tag en este grupo, @{ $username }

tag-entry =
        - <code>{ $tagName }</code> <i>{ $count ->
            [one] 1 suscriptor
        *[other] { $count } suscriptores
        }</i>

################
### SETTINGS ###
################

settings-main =
    .header = <b>🌟 Panel de control TagBot 🌟</b>
    .description = 
        👉🏻 <i>Selecciona el grupo que quieres gestionar.</i>

        🛠️ <i>¿No ves un grupo del que eres admin? Envía /restart allí e inténtalo de nuevo</i>
    .permissions = 🛡️ Permisos 🛡️

settings-group =
    .header = 👉🏻 <b>Grupo:</b> { $groupName }
    .description =
        ⚙️ <i>Gestiona quién puede usar los comandos del bot, el idioma y elimina tags no usados</i>.

settings-create = 
    .header = ✏️ <b>¿Quién puede crear tags?</b>
    .description = <i>Elige quién puede crear nuevos tags en este grupo.</i>
    .btn = ✏️ /create

settings-delete = 
    .header = 💣 <b>¿Quién puede eliminar tags?</b>
    .description = <i>Elige quién puede eliminar los tags existentes en este grupo.</i>
    .btn = 💣 /delete

settings-rename = 
    .header = ✍️ <b>¿Quién puede renombrar tags?</b>
    .description = <i>Configura quién puede renombrar tags en el grupo.</i>
    .btn = ✍️ /rename

settings-current = <u>Configuración actual:</u> { $current }

settings-permissions =
    .everyone = 🌍 Todos
    .only-admins = 👑 Solo admins
    .admins-creators = 🔧 Creadores de tags & admins

settings-language =
    .header = 🌐 <b>Seleccionar idioma del bot</b>
    .description-group = <i>Elige el idioma que el bot usará para enviar mensajes en este grupo.</i> 
    .description-private = <i>Elige el idioma que el bot usará en este chat privado.</i>
    .current = <u>Idioma actual:</u> { $current }
    .btn = 🌐 Idioma

settings-manage-tags =
    .header = 🗑️ <i>Selecciona qué tags mostrar.</i>
    .btn = 🗑️ Tags no usados

settings-del-empty =
    .header = 🫙 <b>Eliminar tags vacíos</b>
    .description = 
        <i>Estos son tags sin suscriptores.</i>
        <i>Puedes eliminarlos uno por uno o todos a la vez.</i>
    
        <i>👇 Toca un tag o "Eliminar todo" para comenzar.</i>

    .all = 🗑️ Eliminar todo
    .btn = 🫙 Tags vacíos
    .none = ⚠️ No se encontraron tags vacíos

settings-del-inactive =
    .header = ⏳ <b>Eliminar tags inactivos</b>
    .description =
        <i>Estos son tags que no se han usado durante un tiempo.</i>
        <i>Puedes eliminarlos uno por uno o según el tiempo de inactividad:</i>

        🕒 <b>3m</b>: inactivo por más de 3 meses
        🕒 <b>6m</b>: inactivo por más de 6 meses
        🕒 <b>12m</b>: inactivo por más de 1 año

    .btn = 📜 Tags inactivos
    .none = ⚠️ No se encontraron tags inactivos

settings-misc =
    .confirm = ⚠️ ¿Seguro?
    .cancel = ⬅️ Cancelar
    .back = ⬅️ Atrás
    .close = ✖️ Cerrar

#################
### LANGUAGES ###
#################
language =
    .it = Italiano
    .en = Inglés
    .ru = Ruso
    .fr = Francés
    .es = Español
