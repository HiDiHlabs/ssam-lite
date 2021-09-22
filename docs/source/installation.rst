############
Installation
############

SSAM-lite comes in two flavours -- SSAM-lite-solo and SSAM-lite-server.
While the usage is almost identical the installation differs quite a lot.
If you need some help deciding which of the two fits your needs best and 
what the differences are follow the guide :ref:`solo-or-server`


.. _supported-browsers:

Supported Browsers
==================

TODO
We should add some stuff about requirements etc


SSAM-lite-solo
==============

The installation of SSAM-lite-solo could not be easier. You either clone the 
`GitHub repository <https://github.com/HiDiHlabs/ssam-lite>`__

.. code-block:: bash

   git clone https://github.com/HiDiHlabs/ssam-lite.git


or download it as zip-file from GitHub and then extract it.

That is literally all, you are ready to go.



SSAM-lite-server
================

To install SSAM-lite-server you first need to clone the
`GitHub repository <https://github.com/HiDiHlabs/ssam-lite-server>`__

.. code-block:: bash

    git clone https://github.com/HiDiHlabs/ssam-lite-server.git


Next we create a ``conda`` environment and activate it.

.. code-block:: bash

    conda create -n flask
    conda activate flask

.. note::

    You can set the environment name to your preferences.


Now we need to install some dependencies. TODO should we provide versions of the packages?

.. code-block:: bash

    conda install flask numpy pandas


Finally, start the Flask app (the default port will be 5000).

.. code-block:: bash

    export FLASK_APP=./ssam-lite-server/flask/run.py
    flask run


.. note::

   The port and further settings can be made in the *run.py* file or when starting the app with
   ``flask run``. For further information we would refer the reader to the 
   `Flask documentation <https://flask.palletsprojects.com/>`__. 
