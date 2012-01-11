# ShortTag.js

This is a basic templating system in node.js

* based on php shorttag/longtag
* *super simple* and *immediatly understandable*

## TODO

* make a demo in browser and in node
* warning for user input sanatization
  * shorttag.js doesnt do user input sanatization for you. If your data is coming
    from a untrusted user, it is up to you to sanatize them.

### To install

npm install shorttag

### example

Suppose you get the template being

> Let do an addition <?= 1+5 ?>
> Let do an addition <?= 1+5 ?>
> isnt that <? console.log("super") ?>?

The result gonna be

> Let do an addition 6
> isnt that super?

