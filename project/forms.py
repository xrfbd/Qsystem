# coding=utf-8
from django import forms

#login
from django.utils.translation import ugettext_lazy as _
from models import user
from models import department
import datetime
import hashlib
        
class UserForm(forms.Form):
    username = forms.CharField(label='账号：',max_length=100,required=True,error_messages={'required': u'必选项'})
    realname = forms.CharField(label='姓名：',max_length=100,required=True,error_messages={'required': u'必选项'})
    password = forms.CharField(label='密码：',max_length=100,widget=forms.PasswordInput(),required=True,error_messages={'required': u'必选项'})
    confirmpassword=forms.CharField(label="确认密码",max_length=100,widget=forms.PasswordInput(),required=True,error_messages={'required': u'必选项'}
    )
    departmentid = forms.CharField(label='部门：',max_length=100)
    # Create your views here.
    
    def save(self):
        password = hashlib.md5(self.cleaned_data['password']).hexdigest()
        new_user = user.objects.create(username =self.cleaned_data['username'],
                                       realname =self.cleaned_data['realname'],
                                       password=password,
                                       create_time=datetime.datetime.now(),
                                       department=department.objects.get(id=self.cleaned_data['departmentid']),isactived=1)
        return new_user

class LoginForm(forms.Form):
    username=forms.CharField(
        label=_(u"用户名"),
        max_length=20,
        error_messages={'required': u'您输入的帐号为空，请输入'}
        )
    password=forms.CharField(
        label=_(u"密码"),
        required=False,
        widget=forms.PasswordInput,
        max_length=20
        )
    isautologin=forms.BooleanField(
        label=_(u"自动登录"),
        required=False
        )
#login


class ProjectForm(forms.Form):
	priority = forms.IntegerField(required=True, error_messages={'required':u'优先级不能为空','invalid':u'优先级必须是正整数'})
	project = forms.CharField(required=True, error_messages={'required':u'项目名称不能为空'})
	status_p = forms.CharField(required=True, error_messages={'required':u'项目状态不能为空'})
	leader_p = forms.IntegerField(required=True, error_messages={'required':u'负责人不能为空'})
	designer_p = forms.IntegerField(required=False)
	tester_p = forms.IntegerField(required=False)
	start_date = forms.DateField(required=False)
	expect_launch_date=forms.DateField(required=False)
	estimated_product_start_date = forms.DateField(required=False)
	estimated_product_end_date = forms.DateField(required=False)
	estimated_develop_start_date = forms.DateField(required=False)
	estimated_develop_end_date = forms.DateField(required=False)
	estimated_test_start_date = forms.DateField(required=False)
	estimated_test_end_date = forms.DateField(required=False)
	blueprint_p = forms.CharField(required=False)
	develop_plan_p = forms.CharField(required=False)
	test_plan_p = forms.CharField(required=False)
	test_case_p = forms.CharField(required=False)
	test_report_p = forms.CharField(required=False)
	relateduser = forms.CharField(required=False)

class changedesignForm(forms.Form):
	content=forms.CharField(required=True,error_messages={'invalid':u'变更内容不能为空'})
	dpath = forms.CharField(required=True,error_messages={'invalid':u'设计图地址不能为空'})
	changeid = forms.IntegerField(required=True)

class delayprojectForm(forms.Form):
    delay_date=forms.DateField(required=True,error_messages={'invalid':u'延期日期不能为空'})
    delay_reason = forms.CharField(required=True,error_messages={'invalid':u'延期理由不能为空'})
    delayid = forms.IntegerField(required=True)
    protime = forms.CharField(required=True)


class ProjectSearchForm(forms.Form):
	project=forms.CharField(required=False)
	start_date_s=forms.DateField(required=False)
	end_date_s=forms.DateField(required=False)
	status_p=forms.CharField(required=False)
	leader_p=forms.CharField(required=False)

class TestForm(forms.Form):
	delayid = forms.IntegerField(required=True,error_messages={'required':u'优先级不能为空','invalid':u'优先级必须是正整数'})
	reason = forms.CharField(required=True, error_messages={'required':u'项目名称不能为空'})

class ProusermessForm(forms.Form):
	usermessageid = forms.IntegerField(required=True,error_messages={'required':u'优先级不能为空','invalid':u'优先级必须是正整数'})
	
class MessageForm(forms.Form):
	messageid = forms.IntegerField(required=True,error_messages={'required':u'优先级不能为空','invalid':u'优先级必须是正整数'})
	
class NoticeForm(forms.Form):
	noticeid = forms.IntegerField(required=True,error_messages={'required':u'优先级不能为空','invalid':u'优先级必须是正整数'})

	
class Approveform(forms.Form):
	delayid1 = forms.IntegerField(required=True,error_messages={'required':u'优先级不能为空','invalid':u'优先级必须是正整数'})	