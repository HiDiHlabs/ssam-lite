##################
quickstart / tl;dr
##################

SSAM-lite is an easy to use a lightweight web browser application to identify cell types 
in single-molecule spatial transcriptomic data such as MERFISH, SEQfish, ISS/CARTANA, osmFISH, etc.
This quickstart guide is for you if you have

- very little time,
- an understanding of `SSAM <https://www.nature.com/articles/s41467-021-23807-4>`__,
- or just want to get a quick glance at what SSAM-lite can do.

Otherwise we would recommend that you have a look at the :ref:`user guide <user-guide>`.


Test data
=========

Download the test data from Zenodo (https://zenodo.org/record/5517607) and unzip it.


Open SSAM-lite
==============

Enter https://ssam-lite.bihealth.org in the address bar of your favourite web browser.


My first analysis
=================

Click on "Get going!"

You are in the **Data Center** now. Click on "Coordinates" and select the *coordinates.csv* from the *Codeluppi_osmFISH* directory in the test data.
Do the same for the "Signatures" (obviously use the *signature.csv* from the same directory this time, *duh!*)

In the **Parameters** section leave the *pixel width* at its default, set the *KDE kernel bandwidth* to 5 and the 
*expression threshold* to 50.

The time is flying by so we head straight for **Analysis** without any further explanation and click on 
"Run Kernel Density Estimation". Time for a short break now, this step might take a few seconds.

When the KDE has been estimated scroll further down and hit "Infer Cell Types". 

As last step adjust the color palette by clicking the "Custom color map" button and selecting
the *custom_colors.csv*.

Done!

That's how easy SSAM-lite is!