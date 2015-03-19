# coding=utf-8
from django import forms

class searchForm(forms.Form):
	categoryid = forms.CharField(max_length=100, required=False)
	testmodule = forms.CharField(required=False)
	priority = forms.CharField(required=False)
	author = forms.CharField(required=False)
	executor = forms.CharField(required=False)
	start_date = forms.DateField(required=False)
	end_date = forms.DateField(required=False)
	exec_status = forms.CharField(required=False)
	keyword = forms.CharField(required=False)