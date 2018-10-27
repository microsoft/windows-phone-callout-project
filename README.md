Windows Phone Callout Project
=============================

Windows Phone Callout Project (WPC) is a small, easy to use JavaScript widget
that shows a call out inviting the user to visit the Windows Phone Store and
download the native application associated to the website she is visiting.

## Features ##

* **Zero configuration**: Include a couple of lines to your page and let us take care of the rest, if you want more control you can disable the auto-pilot and fine tune the script behavior.
* **Resolution independent**: Whatever screen resolution you have, whatever viewport position or scaling the user is looking at, the message is always on the right spot.
* **Multilingual**: The message is displayed in the correct user's locale.
* **Feather light**: It's so small your server wouldn't even notice.
* **Windows Phone only**: The script is totally ignored by any other device.

## Basic implementation ##

The callout is very easy to add to any website and doesn't require coding skill.
To work properly the widget needs three elements that have to be added to the
page `HEAD`.

### The CSS ###

The CSS comes with some basic styling for the call out. You can use it as is, or
customize it as you please.

```xml
<link rel="stylesheet" type="text/css" href="wpc.css">
```

### The script itself ###

This is the widget core. All the magic happens here.

```xml
<script type="text/javascript" src="wpc.js"></script>
```

### The meta tag ###

The custom `wpc-appid` meta tag must contain the Windows Phone Store application
ID. This is the application that will be linked in the call out. The code below
jumps to the
[Level](http://www.windowsphone.com/en-us/store/app/level/c14e93aa-27d7-df11-a844-00237de2db9e)
app, of course you need to change that to your application ID.

```xml
<meta name="wpc-appid" content="c14e93aa-27d7-df11-a844-00237de2db9e">
```

To sum up, all you need to do is to add the followings inside your document `HEAD`.

```xml
<meta name="wpc-appid" content="c14e93aa-27d7-df11-a844-00237de2db9e">
<link rel="stylesheet" type="text/css" href="styles/wpc.css">
<script type="text/javascript" src="js/wpc.js"></script>
```

## Spice up the callout ##

It is completely optional, but you can customize the message by setting a couple
of additional Microsoft-standard meta tags (that you probably already have). If
you don't set the tile image, we are using one default Windows logo for you.

You can have an icon next to the text by adding the `msapplication-TileImage` meta.

```xml
<meta name="msapplication-TileImage" content="images/icon.png">
```

You can also set the call out background color with the `msapplication-TileColor`
meta. The foreground color is automatically computed, how cool is that?

```xml
<meta name="msapplication-TileColor" content="#2A75DF">
```

## Advanced usage ##

For the adventorous there's of course an advanced mode. You can call the message
programmatically like so:

```xml
<script>
var callout = new WPC(options);
</script>
```

Where options is an object to customize the script andbehavior and callout look.
Please note that it's your duty to wait for the document to be ready for DOM
manipulation. In case on "manual mode", the script doesn't make any check.
Usually it is sufficient to place the above code anywhere inside the `body` tag.

## API: options ##

### appId ###

Instead of using the `wpc-appid` you may pass the application ID with this
option. It takes precedence over the meta tag (ie: the meta tag is ignored and
this value taken instead).

### tileImage ###

Alternative to the `msapplication-TileImage` meta tag. You can pass the URL of
the image that will be displayed in the callout. It overrides the meta tag value.

### tileColor ###

Alternative to the `msapplication-TileColor` meta tag. Sets the background color
of the callout. It overrides the meta tag value.

### tileTextColor ###

Used to set the foreground color of the callout. Otherwise the value is
automatically computed (white on dark background, black on light background).

### message ###

You can pass a custom message that will be used instead of the default. Note
that this option negates the localization feature.

The message can contain markup, actually it expects the text to be inside a `P`
tag, but if you alter the CSS you can style the message anyway you want. You can
also use the `%appLink` keyword that will be replaced with the Windows Phone
link. For example:

```js
var callout = new WPC({
    message: '<p><a href="%appLink">Ciao!</a></p>'
});
```

This would show a custom message with the word "ciao!" linked to the Windows
Phone application.

### closeButton ###

Whether or not to display the close button. Default: `true`

### maxDisplayCount ###

Absolute number of times the message will be shown to each user. Set to 0 to
always show. Default: `0`

### pace ###

Time to wait before showing the message again. This may be used to prent the
message to pop up too many time per user session. Set to 0 to show at each
access. Default: `0`

### session ###

The name of the local storage variable. This doesn't need to be changed unless
you have multiple application on the same domain, in which case you can give
each application a different session name. This is actually only needed in
conjunction `maxDisplayCount` and `pace` options. Default: `'com.nokia.wpc'`

### follow ###

Should the message follow the viewport during scrolling or stay fixed on top.
Default: `false` (fixed on top)

### closeAction ###

What action to perform when the user tap the close button. The options are:
`postpone`, to show the message again only after 30 minutes, and `optout` to
never show the call out again.

### debug ###

Set to `true` to display the callout on every device (not just Windows Phone).
Useful in development phase.

## API: callbacks ##

The widget offers two callbacks: `onShow` and `onHide`. They are respectively
called when the message is shown and hidden. This page takes advantage of these
callbacks to push the page up and down, please note that by default the script
doesn't touch the DOM in any way. This would be the code:

```js
var wrapper = document.getElementById('wrapper');
var callout = new WPC({
    debug: true,
    onShow: function () {
        wrapper.style.marginTop = '180px';
    },
    onHide: function () {
        wrapper.style.marginTop = '0';
    }
});
```

## API: methods ##

All methods are public (of course, this is Javascript) but the only features you
may need are:

### optOut() ###

This is never used internally but can be implemented by the diligent developer
to opt-out a user from the call out display, eg: you may add a "Do not show this
message again" option.

### clearSession() ###

Useful in development phase to clear the user session if you use
`maxDisplayCount` or `pace` options.

## WordPress integration ##

The simplest way to integrate the script into a WordPress theme is to place the
required code and metas in the `header.php` file. For example, this is an
excerpt of the header file that comes with a default installation of WordPress.

```xml
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width">
    <title><?php wp_title( '|', true, 'right' ); ?></title>
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
    <!--[if lt IE 9]>
    <script src="<?php echo get_template_directory_uri(); ?>/js/html5.js"></script>
    <![endif]-->

<!-- WPC CODE STARTS HERE -->

<meta name="wpc-appid" content="c14e93aa-27d7-df11-a844-00237de2db9e">
<link rel="stylesheet" type="text/css" href="styles/wpc.css">
<script type="text/javascript" src="js/wpc.js"></script>

<!-- WPC CODE ENDS HERE -->

    <?php wp_head(); ?>
</head>
```

----

Developed with <3 by Matteo Spinelli for Microsoft in 2014

This project has been discontinued
