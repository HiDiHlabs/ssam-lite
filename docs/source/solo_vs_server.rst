 .. _solo-or-server:

###############
Solo or Server?
###############

This page is meant to help you explain the differences between SSAM-lite-solo and SSAM-lite-server.

First of all, it is important to note that both are (currently) equivalent in functionality. So
the decision will not be based on what you want to do with it but rather how you want to use and deploy it.

Nevertheless, it might make sense to have a look at what might be better suited to your needs.

.. note::

    If you want to test SSAM-lite we recommend you first try the SSAM-lite-solo implementation 
    as the setup is much faster. After that you can still come back and checkout the server version.


SSAM-lite-solo
===============

Advantages
    - **No installation**: Because you only need to download it, it is quick to deploy and you can start your analysis after less than 2 minutes. 
    - **No network** required: The analysis is run locally on your device and is executed by your browser. That means that no network connection is required and you can perform analysis on the go.

Use case
    For all researchers that want to get started right away, are the only ones in their group/department
    analysing spatial transcriptomics data, or want to be able to run analysis even when not connected to 
    the network.


SSAM-lite-server
================

Advantages
    - Deploy for **multiple users**: The server version can be setup on a server once and then served to multiple users within the network.
    - Higher **compute power**: In most cases you will have a higher compute power (especially memory) available if you run it on a server and not e.g. a laptop.

Use case
    This can be deployed on e.g. an institute server to be used by a research group, 
    a core facility or a whole department/institute. It only needs to be installed 
    once and can be served to all users in the network as WebApp.

Technically, you could also deploy the server version on your own laptop and then run it
as localhost. However, currently there are no benfits to this approach.