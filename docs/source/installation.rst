############
Installation
############

SSAM-lite comes in two flavors -- SSAM-lite-solo and SSAM-lite-server.
While the usage is almost identical the installation differs quite a lot.
If you need some help deciding which of the two fits your needs best and what the differences are follow the guide
:ref:`solo-or-server`


.. _supported-browsers:

Supported Browsers
==================

TODO
We should add some stuff about requirments etc


SSAM-lite-solo
==============

The installation of SSAM-lite-solo could not be easier. You either clone the 
`GitHub repository <https://github.com/sebastiantiesmeyer/ssamLite>`__

.. code-block:: bash

   git clone https://github.com/sebastiantiesmeyer/ssamLite

or download it as zip-file from GitHub and then extract it.

That is literally all, you are ready to go.



SSAM-lite-server
================

Will this be implemented?

To install SSAM-lite-server you first need to clone the
`GitHub repository <https://github.com/sebastiantiesmeyer/ssamLiteDev>`__

.. code-block:: bash

    git clone https://github.com/sebastiantiesmeyer/ssamLiteDev

How to handle signatures ????
Download singatures: https://www.dropbox.com/s/8qxkgg16zelg6ya/new_sheet.tar.xz?dl=0
Place signatures in data/genetics/ ???

Next we create a ``conda`` environment (TODO we should provide a yaml?) and activate it.

.. code-block:: bash

    conda create -n flask
    conda activate flask

.. note::

    You can set the environment name to your preferences.

Now we need to install some dependencies. TODO should we provide versions of the packages?

.. code-block:: bash

    conda install flask numpy pandas

And start the server.
    cd /ssamLiteDev/scripts/flask
    export FLASK_APP=run.py
    export FLASK_ENV=development
    flask run

Open browser at 127.0.0.1:5000

This definitely needs to be explained.
However, somebody with a little bit expertise should do this,
most of it will be config dependent and people installing this will most likely know what they are doing!